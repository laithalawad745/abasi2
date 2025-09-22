// components/PlayerCareerLocalGame.jsx - النسخة المحلية من لعبة مسيرة اللاعب
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { playerCareerData, searchPlayers, isValidPlayerName } from '../app/data/playerCareerData';
import Link from 'next/link';

export default function PlayerCareerLocalGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(20); // 🔄 20 سؤال إجمالي = 10 لكل فريق
  const [usedPlayers, setUsedPlayers] = useState([]);
  
  // نظام التناوب المحلي - مطابق للعبة النرد
  const [currentTurn, setCurrentTurn] = useState('red'); // 'red' أو 'blue'
  const [teams, setTeams] = useState([
    { name: 'اللاعب الأول', color: 'red', score: 0 },
    { name: 'اللاعب الثاني', color: 'blue', score: 0 }
  ]);
  
  // نظام المحاولات والإجابة
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [roundWinner, setRoundWinner] = useState(null);
  
  // نظام البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isValidAnswer, setIsValidAnswer] = useState(false);
  
  // مراجع
  const searchInputRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // تهيئة العميل
  useEffect(() => {
    setIsClient(true);
  }, []);

  // بدء اللعبة
  const startGame = () => {
    setGamePhase('playing');
    startNewQuestion();
  };

  // بدء سؤال جديد
  const startNewQuestion = () => {
    const availablePlayers = playerCareerData.filter(p => !usedPlayers.includes(p.id));
    if (availablePlayers.length === 0) {
      console.log('⚠️ لا توجد لاعبين متاحين - إنهاء اللعبة');
      setGamePhase('finished');
      return;
    }
    
    const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    const newUsedPlayers = [...usedPlayers, randomPlayer.id];
    setUsedPlayers(newUsedPlayers);
    setCurrentPlayer(randomPlayer);
    
    // إعادة تعيين حالة السؤال
    setHasAnswered(false);
    setShowCorrectAnswer(false);
    setRoundWinner(null);
    setAttemptsLeft(3);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsValidAnswer(false);
    
    // التركيز على حقل البحث
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // التعامل مع البحث
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = searchPlayers(query);
      setSuggestions(results.slice(0, 8));
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
      setIsValidAnswer(isValidPlayerName(query));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsValidAnswer(false);
    }
  };

  // اختيار اقتراح
  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setIsValidAnswer(true);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // التعامل مع الضغط على المفاتيح
  const handleKeyPress = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && isValidAnswer) {
        submitAnswer();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else if (isValidAnswer) {
          submitAnswer();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // إرسال الإجابة
  const submitAnswer = () => {
    if (!searchQuery.trim() || hasAnswered || attemptsLeft <= 0) return;
    if (!isValidAnswer) return;

    const isCorrect = currentPlayer?.name === searchQuery.trim();
    const points = isCorrect ? 100 : 0;
    const newAttemptsLeft = isCorrect ? attemptsLeft : attemptsLeft - 1;

    setAttemptsLeft(newAttemptsLeft);

    if (isCorrect) {
      // إجابة صحيحة
      setRoundWinner(currentTurn);
      setHasAnswered(true);
      
      // تحديث النقاط
      setTeams(prev => prev.map(team => 
        team.color === currentTurn 
          ? { ...team, score: team.score + points }
          : team
      ));
      
      // إظهار الإجابة الصحيحة
      setTimeout(() => {
        setShowCorrectAnswer(true);
        
        // الانتقال للسؤال التالي أو انهاء اللعبة
        setTimeout(() => {
          if (currentRound >= totalRounds) {
            setGamePhase('finished');
          } else {
            nextRound();
          }
        }, 2000);
      }, 1000);
      
    } else if (newAttemptsLeft <= 0) {
      // نفدت المحاولات
      setHasAnswered(true);
      
      // إظهار الإجابة الصحيحة
      setTimeout(() => {
        setShowCorrectAnswer(true);
        
        // الانتقال للسؤال التالي أو انهاء اللعبة
        setTimeout(() => {
          if (currentRound >= totalRounds) {
            setGamePhase('finished');
          } else {
            nextRound();
          }
        }, 2000);
      }, 1000);
      
    } else {
      // إجابة خاطئة لكن ما زالت هناك محاولات
      setSearchQuery('');
      setIsValidAnswer(false);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 500);
    }
  };

  // الانتقال للجولة التالية
  const nextRound = () => {
    setCurrentRound(prev => prev + 1);
    
    // التبديل بين اللاعبين - مطابق للعبة النرد
    setCurrentTurn(prev => prev === 'red' ? 'blue' : 'red');
    
    // بدء سؤال جديد
    startNewQuestion();
  };

  // زر "عجزت عن السؤال"
  const handleGiveUp = () => {
    setHasAnswered(true);
    
    // إظهار الإجابة الصحيحة
    setTimeout(() => {
      setShowCorrectAnswer(true);
      
      // الانتقال للسؤال التالي
      setTimeout(() => {
        if (currentRound >= totalRounds) {
          setGamePhase('finished');
        } else {
          nextRound();
        }
      }, 2000);
    }, 1000);
  };

  // التعامل مع النقر والـ blur
  const handleInputClick = () => {
    if (searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // تحديد الفائز
  const getWinner = () => {
    if (teams[0].score > teams[1].score) return teams[0];
    if (teams[1].score > teams[0].score) return teams[1];
    return null; // تعادل
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              مسيرة لاعب
            </span>
            <span className="text-sm md:text-base font-normal text-purple-400 ml-2">محلي</span>
          </div>
          <Link 
            href="/player-career"
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            ← رجوع
          </Link>
        </div>

        {/* شاشة الإعداد */}
        {gamePhase === 'setup' && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                لعبة مسيرة اللاعب المحلية
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                العب مع صديق على نفس الجهاز. 20 سؤال إجمالي - 10 أسئلة لكل لاعب بالتناوب!
              </p>

              {/* قواعد اللعبة */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-2xl p-6 border border-cyan-500/30">
                  <div className="text-4xl mb-4">⚽</div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">مسيرة اللاعب</h3>
                  <p className="text-gray-300">شاهد مسيرة لاعب وخمن من هو</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-purple-500/30">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-purple-400 mb-2">3 محاولات</h3>
                  <p className="text-gray-300">لكل لاعب 3 محاولات لكل سؤال</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-green-500/30">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">10 أسئلة لكل لاعب</h3>
                  <p className="text-gray-300">اللاعبان يتناوبان - 20 سؤال إجمالي</p>
                </div>
              </div>

              {/* زر البدء */}
              <button
                onClick={startGame}
                disabled={!isClient}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`relative px-12 py-6 rounded-3xl font-bold text-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-400/50 ${
                  isClient 
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white cursor-pointer' 
                    : 'bg-gray-500 cursor-not-allowed opacity-50 text-gray-300'
                }`}>
                  🎮 ابدأ اللعبة
                </div>
              </button>
            </div>
          </div>
        )}

        {/* شاشة اللعب */}
        {gamePhase === 'playing' && currentPlayer && (
          <div className="max-w-6xl mx-auto">
            
            {/* معلومات الجولة واللاعب الحالي */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-6">
                <div className={`px-6 py-3 border-2 rounded-2xl font-bold text-xl transition-all duration-300 ${
                  currentTurn === 'red'
                    ? 'bg-gradient-to-r from-red-500/30 to-red-600/30 border-red-400/50 text-red-300 ring-2 ring-red-400/50'
                    : 'bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-400/20 text-red-400'
                }`}>
                  {teams[0].name}: {teams[0].score} نقطة
                  {roundWinner === 'red' && <span className="ml-2">🏆</span>}
                </div>
                
                <div className={`px-6 py-3 border-2 rounded-2xl font-bold text-xl transition-all duration-300 ${
                  currentTurn === 'blue'
                    ? 'bg-gradient-to-r from-blue-500/30 to-blue-600/30 border-blue-400/50 text-blue-300 ring-2 ring-blue-400/50'
                    : 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-400/20 text-blue-400'
                }`}>
                  {teams[1].name}: {teams[1].score} نقطة
                  {roundWinner === 'blue' && <span className="ml-2">🏆</span>}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  الجولة {currentRound} / {totalRounds}
                </div>
                <div className={`text-sm font-medium ${
                  currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  دور {currentTurn === 'red' ? teams[0].name : teams[1].name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  🔴 أحمر: {Math.ceil(currentRound / 2)} • 🔵 أزرق: {Math.floor(currentRound / 2)}
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              
              {/* عنوان السؤال */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  من هذا اللاعب؟
                </h2>
                <div className={`inline-block px-4 py-2 rounded-xl font-bold ${
                  currentTurn === 'red' 
                    ? 'bg-red-500/20 text-red-400 border border-red-400/50'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-400/50'
                }`}>
                  {currentTurn === 'red' ? teams[0].name : teams[1].name} - دورك!
                </div>
              </div>

              {/* التلميحة العامة */}
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/50 rounded-2xl">
                  <div className="text-2xl text-purple-400 font-bold">
                    💡 {currentPlayer.hint}
                  </div>
                </div>
              </div>

              {/* المسيرة الكاملة */}
              <div className="space-y-6 mb-8">
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  {currentPlayer.career.map((club, index) => (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center group">
                        <div className="w-14 h-14 md:w-18 md:h-18 bg-[#1a1a27] rounded-full p-2 transition-all duration-300 group-hover:scale-110 shadow-xl">
                          <img 
                            src={`/clubs/${club.club}.png`}
                            alt={club.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = '/clubs/default.png';
                            }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-400 font-bold text-center max-w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {club.name}
                        </div>
                      </div>
                      
                      {index < currentPlayer.career.length - 1 && (
                        <div className="text-lg md:text-xl text-cyan-400 animate-pulse mx-1">
                          ➡️
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* إظهار من فاز بالسؤال */}
              {roundWinner && !showCorrectAnswer && (
                <div className="text-center mb-8">
                  <div className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-2xl">
                    <div className="text-2xl text-yellow-400 font-bold">
                      🎉 {roundWinner === 'red' ? teams[0].name : teams[1].name} فاز بهذا السؤال!
                    </div>
                  </div>
                </div>
              )}

              {/* مربع البحث والإجابة */}
              {!showCorrectAnswer && !roundWinner && (
                <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-2 border-purple-400/50 rounded-2xl p-6">
                  {/* عداد المحاولات */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-white/70">المحاولات المتبقية:</span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < attemptsLeft
                                ? 'bg-green-500'
                                : 'bg-red-500/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* مربع البحث */}
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="ابحث عن اسم اللاعب..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyPress}
                      onClick={handleInputClick}
                      onBlur={handleInputBlur}
                      disabled={hasAnswered}
                      className={`w-full px-6 py-4 pr-14 text-xl text-white bg-slate-800/50 border-2 rounded-2xl focus:outline-none transition-all duration-300 placeholder-gray-400 ${
                        isValidAnswer 
                          ? 'border-green-500 focus:border-green-400 shadow-lg shadow-green-500/20' 
                          : showSuggestions 
                            ? 'border-blue-500 focus:border-blue-400' 
                            : 'border-gray-600 focus:border-purple-400'
                      }`}
                    />
                    
                    {/* أيقونة البحث */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* قائمة الاقتراحات */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className={`px-6 py-3 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                              index === selectedSuggestionIndex 
                                ? 'bg-purple-600/30 text-white' 
                                : 'text-gray-300 hover:bg-slate-700'
                            }`}
                            onMouseDown={() => selectSuggestion(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* أزرار الإجابة والاستسلام */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={submitAnswer}
                      disabled={!isValidAnswer || hasAnswered}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        isValidAnswer && !hasAnswered
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      إرسال الإجابة
                    </button>

                    {/* زر "عجزت عن السؤال" */}
                    {!hasAnswered && (
                      <button
                        onClick={handleGiveUp}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                      >
                        🏳️ عجزت عن السؤال
                      </button>
                    )}
                  </div>

                  {/* نصائح للمستخدم */}
                  {!isValidAnswer && searchQuery.length > 0 && (
                    <div className="mt-4 text-center">
                      <p className="text-yellow-400 text-sm">
                        💡 ابدأ بكتابة جزء من اسم اللاعب واختر من الاقتراحات
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* الإجابة الصحيحة */}
              {showCorrectAnswer && (
                <div className="text-center">
                  <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-2xl">
                    <h3 className="text-2xl font-bold text-white mb-2">✅ الإجابة الصحيحة:</h3>
                    <p className="text-3xl font-bold text-green-400">{currentPlayer?.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* شاشة انتهاء اللعبة */}
        {gamePhase === 'finished' && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-4xl font-bold text-white mb-8">🏁 انتهت اللعبة!</h2>
              
              <div className="space-y-4 mb-8">
                <div className="text-2xl">
                  <span className="text-white">النتيجة النهائية:</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className={`p-6 rounded-2xl text-center transition-all duration-300 ${
                    teams[0].score > teams[1].score 
                      ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-400/50 ring-2 ring-green-400/50' 
                      : teams[0].score < teams[1].score
                        ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-400/30'
                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30'
                  }`}>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      teams[0].score > teams[1].score ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {teams[0].name}
                    </h3>
                    <p className="text-4xl font-bold text-white">{teams[0].score}</p>
                    <p className="text-gray-300 mt-2">نقطة</p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl text-center transition-all duration-300 ${
                    teams[1].score > teams[0].score 
                      ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-2 border-green-400/50 ring-2 ring-green-400/50' 
                      : teams[1].score < teams[0].score
                        ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-400/30'
                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30'
                  }`}>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      teams[1].score > teams[0].score ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {teams[1].name}
                    </h3>
                    <p className="text-4xl font-bold text-white">{teams[1].score}</p>
                    <p className="text-gray-300 mt-2">نقطة</p>
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-yellow-400 mt-6">
                  {(() => {
                    const winner = getWinner();
                    if (!winner) return '🤝 تعادل!';
                    return `🎉 ${winner.name} هو الفائز!`;
                  })()}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  🔄 لعب مرة أخرى
                </button>
                
                <Link 
                  href="/player-career"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                >
                  ← العودة للخيارات
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}