// components/EuropeGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sampleTopics } from '../app/data/gameData';
import WorldMap from './WorldMap';
import WorldQuestion from './WorldQuestion';
import { ImageModal } from './Modals';

export default function EuropeGame() {
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
  const [worldTopic, setWorldTopic] = useState(null);

  // تحميل بيانات أوروبا عند بدء المكون
  useEffect(() => {
    const europeData = sampleTopics.find(topic => topic.id === 'world_tour');
    if (europeData) {
      setWorldTopic(europeData);
    }
  }, []);

  // تحميل البيانات المحفوظة
  useEffect(() => {
    try {
      const savedTeams = localStorage.getItem('europe-teams');
      const savedOccupiedCountries = localStorage.getItem('europe-occupied-countries');
      const savedTeamCountries = localStorage.getItem('europe-team-countries');
      const savedCurrentTurn = localStorage.getItem('europe-current-turn');
      const savedGamePhase = localStorage.getItem('europe-game-phase');
      
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
      localStorage.setItem('europe-teams', JSON.stringify(teams));
    } catch (error) {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('europe-occupied-countries', JSON.stringify(occupiedCountries));
    } catch (error) {}
  }, [occupiedCountries]);

  useEffect(() => {
    try {
      localStorage.setItem('europe-team-countries', JSON.stringify(teamCountries));
    } catch (error) {}
  }, [teamCountries]);

  useEffect(() => {
    try {
      localStorage.setItem('europe-current-turn', currentTurn);
    } catch (error) {}
  }, [currentTurn]);

  useEffect(() => {
    try {
      localStorage.setItem('europe-game-phase', gamePhase);
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
      
      setCurrentTurn(currentTurn === 'red' ? 'blue' : 'red');
      setCurrentWorldQuestion(null);
      setShowWorldAnswer(false);
      
      // التحقق من انتهاء اللعبة
      if (worldTopic && newOccupiedCountries.length >= worldTopic.countries.length) {
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
      
      // التحقق من انتهاء اللعبة
      if (worldTopic && occupiedCountries.length >= worldTopic.countries.length) {
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
      localStorage.removeItem('europe-teams');
      localStorage.removeItem('europe-occupied-countries');
      localStorage.removeItem('europe-team-countries');
      localStorage.removeItem('europe-current-turn');
      localStorage.removeItem('europe-game-phase');
    } catch (error) {}
  };

  // صفحة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col">
        <div className="flex justify-between p-4 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
             أوروبا
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
                أوروبا
            </h1>
            
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">قواعد اللعبة:</h2>
              <ul className="text-left text-slate-300 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-green-400">🎯</span>
                  <span>اختر دولة أوروبية للإجابة على سؤال عنها</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">⚔️</span>
                  <span>كل إجابة صحيحة تحتل الدولة وتكسب نقاطها</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">🏆</span>
                  <span>الفريق الذي يحصل على أكثر النقاط يفوز</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yellow-400">🌍</span>
                  <span>{worldTopic ? worldTopic.countries.length : 12} دولة أوروبية متاحة للاحتلال</span>
                </li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-green-400/50"
            >
              🚀 ابدأ الرحلة الأوروبية!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const winner = teams[0].score > teams[1].score ? teams[0] : 
                   teams[1].score > teams[0].score ? teams[1] : null;

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
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              انتهت الرحلة الأوروبية! 🌍
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                teams[0].score > teams[1].score 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-red-500 to-pink-500 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{teams[0].name}</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{teams[0].score}</p>
                <p className="text-sm text-white/80 mt-2">{teamCountries.red.length} دولة محتلة</p>
                {teams[0].score > teams[1].score && <p className="text-yellow-200 font-bold mt-2">الفائز 🏆</p>}
              </div>
              
              <div className={`p-6 rounded-xl transition-all duration-500 ${
                teams[1].score > teams[0].score 
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/50 shadow-2xl' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg'
              }`}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{teams[1].name}</h2>
                <p className="text-3xl md:text-4xl font-bold text-white">{teams[1].score}</p>
                <p className="text-sm text-white/80 mt-2">{teamCountries.blue.length} دولة محتلة</p>
                {teams[1].score > teams[0].score && <p className="text-yellow-200 font-bold mt-2">الفائز 🏆</p>}
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
                {winner ? `${winner.name} هو  الفائز!   ` : 'تعادل   !'}
              </h2>
          
              <p className="text-md text-slate-400 mt-2">
                الفارق في النقاط: {Math.abs(teams[0].score - teams[1].score)} نقطة
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300"
              >
                رحلة جديدة 🗺️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              أوروبا
          </h1>
          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
            >
              إعادة تشغيل
            </button>
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
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
            <p className="text-sm text-white/80 mt-2">{teamCountries.red.length} دولة محتلة</p>
          </div>
          
          <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
            currentTurn === 'blue'
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
          }`}>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-2">{teams[1].name}</h2>
            <p className="text-3xl md:text-4xl font-bold text-white">{teams[1].score}</p>
            <p className="text-sm text-white/80 mt-2">{teamCountries.blue.length} دولة محتلة</p>
          </div>
        </div>

        {/* خريطة العالم */}
        {worldTopic && (
          <WorldMap 
            worldTopic={worldTopic}
            currentTurn={currentTurn}
            currentQuestion={null}
            currentChoiceQuestion={null}
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