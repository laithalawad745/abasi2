// components/ArabGame.jsx - محدث لاستخدام خريطة D3.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTopics } from '../app/data/gameData';
import ArabMapD3 from './ArabMapD3';
import WorldQuestion from './WorldQuestion';
import { ImageModal } from './Modals';

export default function ArabGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'finished'
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);
  const [currentTurn, setCurrentTurn] = useState('red');
  
  // حالة العالم
  const [currentWorldQuestion, setCurrentWorldQuestion] = useState(null);
  const [showWorldAnswer, setShowWorldAnswer] = useState(false);
  const [occupiedCountries, setOccupiedCountries] = useState([]);
  const [teamCountries, setTeamCountries] = useState({
    red: [],
    blue: []
  });
  
  // حالة أخرى
  const [zoomedImage, setZoomedImage] = useState(null);
  const [arabTopic, setArabTopic] = useState(null);

  // تحميل بيانات الدول العربية عند بدء المكون
  useEffect(() => {
    const arabData = sampleTopics.find(topic => topic.id === 'arab_world');
    if (arabData) {
      setArabTopic(arabData);
      console.log('🌍 تم تحميل بيانات الوطن العربي:', arabData.countries.length, 'دولة');
      console.log('🇧🇭 البحرين موجودة:', arabData.countries.find(c => c.id === 'bahrain') ? '✅' : '❌');
    }
  }, []);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    try {
      const savedTeams = localStorage.getItem('arab-teams');
      const savedOccupiedCountries = localStorage.getItem('arab-occupied-countries');
      const savedTeamCountries = localStorage.getItem('arab-team-countries');
      const savedCurrentTurn = localStorage.getItem('arab-current-turn');
      const savedGamePhase = localStorage.getItem('arab-game-phase');
      
      if (savedTeams) setTeams(JSON.parse(savedTeams));
      if (savedOccupiedCountries) setOccupiedCountries(JSON.parse(savedOccupiedCountries));
      if (savedTeamCountries) setTeamCountries(JSON.parse(savedTeamCountries));
      if (savedCurrentTurn) setCurrentTurn(savedCurrentTurn);
      if (savedGamePhase && savedGamePhase !== 'setup') setGamePhase(savedGamePhase);
    } catch (error) {
      console.log('localStorage error');
    }
  }, []);

  // حفظ البيانات
  useEffect(() => {
    try {
      localStorage.setItem('arab-teams', JSON.stringify(teams));
    } catch (error) {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('arab-occupied-countries', JSON.stringify(occupiedCountries));
    } catch (error) {}
  }, [occupiedCountries]);

  useEffect(() => {
    try {
      localStorage.setItem('arab-team-countries', JSON.stringify(teamCountries));
    } catch (error) {}
  }, [teamCountries]);

  useEffect(() => {
    try {
      localStorage.setItem('arab-current-turn', currentTurn);
    } catch (error) {}
  }, [currentTurn]);

  useEffect(() => {
    try {
      localStorage.setItem('arab-game-phase', gamePhase);
    } catch (error) {}
  }, [gamePhase]);

  // بدء اللعبة
  const startGame = () => {
    setGamePhase('playing');
  };

  // اختيار دولة
  const selectCountry = (country) => {
    if (currentTurn && !currentWorldQuestion) {
      // اختيار صعوبة عشوائية
      const difficulties = ['easy', 'medium', 'hard'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      // اختيار سؤال عشوائي من الصعوبة المختارة
      const questionsWithDifficulty = country.questions.filter(q => q.difficulty === randomDifficulty);
      let selectedQuestion;
      
      if (questionsWithDifficulty.length > 0) {
        selectedQuestion = questionsWithDifficulty[Math.floor(Math.random() * questionsWithDifficulty.length)];
      } else {
        selectedQuestion = country.questions[Math.floor(Math.random() * country.questions.length)];
      }
      
      setCurrentWorldQuestion({
        ...selectedQuestion,
        country: country,
        hiddenDifficulty: selectedQuestion.difficulty
      });
      setShowWorldAnswer(false);
    }
  };

  // إنهاء الإجابة
  const finishWorldAnswering = () => {
    setShowWorldAnswer(true);
  };

  // منح النقاط
  const awardWorldPoints = (team) => {
    if (currentWorldQuestion) {
      const newTeams = [...teams];
      const teamIndex = team === 'red' ? 0 : 1;
      const countryPoints = currentWorldQuestion.country.points;
      
      newTeams[teamIndex].score += countryPoints;
      setTeams(newTeams);
      
      // إضافة الدولة للفريق
      const newTeamCountries = { ...teamCountries };
      newTeamCountries[team] = [...newTeamCountries[team], currentWorldQuestion.country.id];
      setTeamCountries(newTeamCountries);
      
      // إضافة الدولة للمحتلة
      const newOccupiedCountries = [...occupiedCountries, currentWorldQuestion.country.id];
      setOccupiedCountries(newOccupiedCountries);
      
      console.log(`✅ ${team} احتل ${currentWorldQuestion.country.name}. المجموع: ${newOccupiedCountries.length}/${arabTopic?.countries?.length || 0}`);
      
      setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
      setCurrentWorldQuestion(null);
      setShowWorldAnswer(false);
      
      // ✅ إصلاح: التحقق من انتهاء اللعبة عند اكتمال جميع الدول
      if (arabTopic && newOccupiedCountries.length >= arabTopic.countries.length) {
        console.log('🏆 انتهت اللعبة! تم احتلال جميع الدول العربية');
        setTimeout(() => {
          setGamePhase('finished');
        }, 1500);
      }
    }
  };

  // عدم وجود إجابة صحيحة
  const noCorrectWorldAnswer = () => {
    if (currentWorldQuestion) {
      setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
      setCurrentWorldQuestion(null);
      setShowWorldAnswer(false);
      
      // ✅ إصلاح: التحقق من انتهاء اللعبة عند اكتمال جميع الدول
      if (arabTopic && occupiedCountries.length >= arabTopic.countries.length) {
        console.log('🏆 انتهت اللعبة! تم احتلال جميع الدول العربية');
        setTimeout(() => {
          setGamePhase('finished');
        }, 1500);
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
    setOccupiedCountries([]);
    setTeamCountries({
      red: [],
      blue: []
    });
    setCurrentWorldQuestion(null);
    setShowWorldAnswer(false);
    
    // حذف البيانات المحفوظة
    try {
      localStorage.removeItem('arab-teams');
      localStorage.removeItem('arab-occupied-countries');
      localStorage.removeItem('arab-team-countries');
      localStorage.removeItem('arab-current-turn');
      localStorage.removeItem('arab-game-phase');
    } catch (error) {}
  };

  // صفحة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 select-none flex flex-col">
        <div className="flex justify-between p-4 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
             الوطن العربي
          </h1>
          <Link 
            href="/"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
          >
            ← العودة للرئيسية
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
          <div className="text-center space-y-8 max-w-2xl">
            <h1 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                الوطن العربي
            </h1>
            
            <div className="text-lg text-slate-300 text-right">
              <p className="mb-4">🌍 اكتشف الدول العربية وأجب على الأسئلة!</p>
              {arabTopic && (
                <p className="mb-4 text-yellow-400">
                  📊 عدد الدول المتاحة: {arabTopic.countries.length} دولة
                  {arabTopic.countries.find(c => c.id === 'somalia') && ' (تشمل الصومال 🇸🇴)'}
                </p>
              )}
              <ul className="list-disc list-inside space-y-2">
                <li className="text-green-400">انقر على أي دولة عربية في الخريطة</li>
                <li className="text-blue-400">أجب على السؤال لتحتل الدولة</li>
                <li className="text-yellow-400">احتل أكبر عدد من الدول لتفوز!</li>
                <li className="text-red-400">فرق حمراء وزرقاء تتنافس</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl font-bold text-xl md:text-2xl shadow-2xl transition-all duration-300 hover:scale-105"
            >
              🚀 ابدأ الرحلة العربية!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب
  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
               الوطن العربي
            </h1>
            <div className="flex gap-2">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
              >
                إعادة تعيين
              </button>
              <Link 
                href="/"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
              >
                ← الرئيسية
              </Link>
            </div>
          </div>

          {/* عرض النقاط */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 md:p-6 rounded-2xl text-center transition-all duration-500 ${
              currentTurn === 'red' 
                ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/25 ring-4 ring-red-400/50'
                : 'bg-gradient-to-br from-red-500/70 to-pink-500/70 shadow-lg'
            }`}>
              <h2 className="text-lg md:text-2xl font-bold text-white mb-2">{teams[0].name}</h2>
              <p className="text-3xl md:text-4xl font-bold text-white">{teams[0].score}</p>
              <p className="text-sm text-white/80 mt-2">{teamCountries.red.length} دولة محتلة</p>
            </div>
            
            <div className={`p-4 md:p-6 rounded-2xl text-center transition-all duration-500 ${
              currentTurn === 'blue' 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
                : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
            }`}>
              <h2 className="text-lg md:text-2xl font-bold text-white mb-2">{teams[1].name}</h2>
              <p className="text-3xl md:text-4xl font-bold text-white">{teams[1].score}</p>
              <p className="text-sm text-white/80 mt-2">{teamCountries.blue.length} دولة محتلة</p>
            </div>
          </div>

          {/* إحصائيات التقدم */}
          {arabTopic && (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 mb-6 shadow-lg border border-slate-700">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">تقدم اللعبة</h3>
                <div className="flex justify-center items-center gap-4 text-sm">
                  <span className="text-green-400">محتلة: {occupiedCountries.length}</span>
                  <span className="text-yellow-400">متبقية: {arabTopic.countries.length - occupiedCountries.length}</span>
                  <span className="text-blue-400">المجموع: {arabTopic.countries.length}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 mt-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(occupiedCountries.length / arabTopic.countries.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* الخريطة */}
          {arabTopic && (
            <ArabMapD3 
              arabTopic={arabTopic}
              currentTurn={currentTurn}
              occupiedCountries={occupiedCountries}
              selectCountry={selectCountry}
              teamCountries={teamCountries}
            />
          )}

          {/* سؤال العالم */}
          <WorldQuestion 
            currentWorldQuestion={currentWorldQuestion}
            showWorldAnswer={showWorldAnswer}
            finishWorldAnswering={finishWorldAnswering}
            awardWorldPoints={awardWorldPoints}
            noCorrectWorldAnswer={noCorrectWorldAnswer}
          />

          {/* Image Modal */}
          <ImageModal 
            zoomedImage={zoomedImage} 
            closeZoomedImage={() => setZoomedImage(null)} 
          />
        </div>
      </div>
    );
  }

  // ✅ إصلاح: صفحة انتهاء اللعبة الكاملة
  if (gamePhase === 'finished') {
    const winner = teams[0].score > teams[1].score ? teams[0] : teams[1];
    const isDraw = teams[0].score === teams[1].score;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4 md:p-8">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl border border-slate-700">
          
          {/* عنوان الانتهاء */}
          <h1 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-8">
            انتهت الرحلة! 🏆
          </h1>
          
          {/* نتيجة الفوز */}
          {isDraw ? (
            <div className="mb-8">
              <div className="text-2xl md:text-4xl font-bold text-yellow-400 mb-4">
                تعادل! 🤝
              </div>
              <p className="text-lg text-slate-300">
                حققتم نفس عدد النقاط في رحلة الوطن العربي
              </p>
            </div>
          ) : (
            <div className="mb-8">
              <div className={`text-2xl md:text-4xl font-bold mb-4 ${winner.color === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                الفائز: {winner.name}! 
              </div>
    
            </div>
          )}

          {/* عرض النتائج النهائية */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-red-500/30 to-pink-500/30 border border-red-400/50 rounded-xl p-4">
              <h3 className="text-lg font-bold text-red-300 mb-2">{teams[0].name}</h3>
              <p className="text-2xl font-bold text-white">{teams[0].score} نقطة</p>
              <p className="text-sm text-red-200 mt-1">{teamCountries.red.length} دولة محتلة</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-400/50 rounded-xl p-4">
              <h3 className="text-lg font-bold text-blue-300 mb-2">{teams[1].name}</h3>
              <p className="text-2xl font-bold text-white">{teams[1].score} نقطة</p>
              <p className="text-sm text-blue-200 mt-1">{teamCountries.blue.length} دولة محتلة</p>
            </div>
          </div>

          {/* إحصائيات اللعبة */}
    
          
          {/* أزرار التنقل */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
            >
              🔄 رحلة جديدة
            </button>
            
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          {/* رسالة شكر */}
    
        </div>
      </div>
    );
  }

  // في حالة حدوث خطأ أو حالة غير متوقعة
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">خطأ غير متوقع</h1>
        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold"
        >
          إعادة تحميل اللعبة
        </button>
      </div>
    </div>
  );
}