// components/ArabGame.jsx - نظام احتلال الدول العربية (بدون نقاط)
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
    { name: 'الفريق الأحمر', color: 'red', conqueredCount: 0 }, // 🔥 تغيير من score إلى conqueredCount
    { name: 'الفريق الأزرق', color: 'blue', conqueredCount: 0 }
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

  // 🔥 فحص دوري من انتهاء اللعبة
  useEffect(() => {
    if (gamePhase === 'playing' && arabTopic && occupiedCountries.length > 0) {
      console.log('🔄 فحص دوري لانتهاء اللعبة العربية:');
      console.log('- دول محتلة:', occupiedCountries.length);
      console.log('- إجمالي دول:', arabTopic.countries.length);
      
      if (occupiedCountries.length >= arabTopic.countries.length) {
        console.log('🎊 تم اكتشاف انتهاء اللعبة العربية بالفحص الدوري!');
        console.log('🏆 الانتقال لصفحة النتائج...');
        setGamePhase('finished');
      }
    }
  }, [occupiedCountries, arabTopic, gamePhase]);

  // تحميل بيانات الدول العربية عند بدء المكون
  useEffect(() => {
    const arabData = sampleTopics.find(topic => topic.id === 'arab_world');
    if (arabData) {
      setArabTopic(arabData);
      console.log('🌍 تم تحميل بيانات الوطن العربي:', arabData.countries.length, 'دولة');
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
      console.log('localStorage error:', error);
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
    console.log('🚀 بدء معركة الوطن العربي!');
    setGamePhase('playing');
  };

  // اختيار دولة
  const selectCountry = (country) => {
    console.log('🎯 محاولة اختيار دولة عربية:', country.name, '(ID:', country.id, ')');
    
    if (occupiedCountries.includes(country.id)) {
      console.log('🚫 الدولة محتلة بالفعل:', country.name);
      return;
    }
    
    console.log('✅ الدولة متاحة للاحتلال');
    console.log('🎲 اختيار سؤال عشوائي من', country.questions.length, 'سؤال متاح');
    
    // اختيار سؤال عشوائي من أسئلة الدولة
    const randomQuestionIndex = Math.floor(Math.random() * country.questions.length);
    const randomQuestion = country.questions[randomQuestionIndex];
    
    console.log('❓ سؤال مختار:', randomQuestion.question);
    console.log('💡 الإجابة الصحيحة:', randomQuestion.answer);
    console.log('📈 صعوبة السؤال:', randomQuestion.difficulty);
    
    setCurrentWorldQuestion({
      ...randomQuestion,
      country: country
    });
    setShowWorldAnswer(false);
  };

  // إنهاء الإجابة
  const finishWorldAnswering = () => {
    console.log('📝 تم الضغط على "أظهر الإجابة"');
    setShowWorldAnswer(true);
  };

  // 🔥 منح النقاط - مُحول لنظام احتلال الدول
  const awardWorldPoints = (team) => {
    console.log('🔥 awardWorldPoints استُدعيت مع:', team, typeof team);
    
    if (!currentWorldQuestion || !currentWorldQuestion.country) {
      console.error('❌ لا يوجد سؤال أو دولة حالية');
      return;
    }

    // تحويل team إلى teamColor مهما كان النوع
    let teamColor;
    if (typeof team === 'string') {
      teamColor = team; // 'red' أو 'blue'
    } else {
      teamColor = team === 0 ? 'red' : 'blue'; // للتوافق مع الأنظمة القديمة
    }

    console.log('🏆 إجابة صحيحة للفريق:', teamColor === 'red' ? 'الأحمر' : 'الأزرق');

    const countryId = currentWorldQuestion.country.id;
    const countryName = currentWorldQuestion.country.name;

    // التحقق من عدم احتلال الدولة مسبقاً (احتياط إضافي)
    if (occupiedCountries.includes(countryId)) {
      console.warn('⚠️ الدولة محتلة بالفعل:', countryName);
      setCurrentWorldQuestion(null);
      setShowWorldAnswer(false);
      return;
    }

    // إضافة الدولة للدول المحتلة
    const newOccupiedCountries = [...occupiedCountries, countryId];
    setOccupiedCountries(newOccupiedCountries);

    // إضافة الدولة للفريق الفائز
    const newTeamCountries = { ...teamCountries };
    newTeamCountries[teamColor] = [...newTeamCountries[teamColor], countryId];
    setTeamCountries(newTeamCountries);

    // 🔥 تحديث عدد الدول المحتلة للفريق (بدلاً من النقاط)
    const newTeams = [...teams];
    const teamIndex = teamColor === 'red' ? 0 : 1;
    newTeams[teamIndex].conqueredCount = newTeamCountries[teamColor].length;
    setTeams(newTeams);

    console.log(`✅ ${countryName} محتلة من قبل ${teamColor === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}`);
    console.log('📊 إحصائيات الفرق العربية:', {
      أحمر: newTeamCountries.red.length,
      أزرق: newTeamCountries.blue.length
    });

    // تغيير الدور
    const nextTurn = currentTurn === 'red' ? 'blue' : 'red';
    console.log('🔄 تغيير الدور من:', currentTurn, '→', nextTurn);
    setCurrentTurn(nextTurn);
    setCurrentWorldQuestion(null);
    setShowWorldAnswer(false);
    
    // التحقق من انتهاء اللعبة (كل الدول محتلة)
    console.log('🔍 فحص انتهاء اللعبة العربية:');
    console.log('- عدد الدول المحتلة:', newOccupiedCountries.length);
    console.log('- إجمالي الدول المتاحة:', arabTopic ? arabTopic.countries.length : 'غير محدد');
    console.log('- هل انتهت اللعبة؟', newOccupiedCountries.length >= (arabTopic?.countries.length || 0));
    
    if (arabTopic && newOccupiedCountries.length >= arabTopic.countries.length) {
      console.log('🎊 انتهت اللعبة العربية! كل الدول محتلة');
      console.log('🏆 إعلان النتيجة خلال 1.5 ثانية...');
      setTimeout(() => {
        setGamePhase('finished');
      }, 1500);
    }
  };

  // عدم وجود إجابة صحيحة
  const noCorrectWorldAnswer = () => {
    console.log('❌ تم الضغط على "لا أحد أجاب صح"');
    
    if (!currentWorldQuestion) {
      console.error('❌ لا يوجد سؤال حالي');
      return;
    }

    console.log('🔄 تغيير الدور فقط بدون احتلال أي دولة');
    console.log('الدور الحالي:', currentTurn, '→ الدور التالي:', currentTurn === 'red' ? 'blue' : 'red');

    // ✅ فقط تغيير الدور بدون احتلال الدولة
    const nextTurn = currentTurn === 'red' ? 'blue' : 'red';
    setCurrentTurn(nextTurn);
    setCurrentWorldQuestion(null);
    setShowWorldAnswer(false);

    console.log('✅ تم إغلاق السؤال بدون احتلال');
  };

  // إعادة تشغيل اللعبة
  const resetGame = () => {
    console.log('🔄 إعادة تشغيل معركة الوطن العربي');
    setGamePhase('setup');
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', conqueredCount: 0 },
      { name: 'الفريق الأزرق', color: 'blue', conqueredCount: 0 }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col">
        <div className="flex justify-between p-4 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
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
              🌍 الوطن العربي
            </h1>
          
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">قواعد اللعبة الجديدة:</h2>
              <ul className="text-left text-slate-300 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-green-400">🎯</span>
                  <span>اختر دولة عربية للإجابة على سؤال عشوائي عنها</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">⚔️</span>
                  <span>إجابة صحيحة = تحتل الدولة</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">❌</span>
                  <span>إجابة خاطئة = الدور للفريق الآخر</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">🏆</span>
                  <span>الفريق الذي يحتل دول عربية أكثر يفوز!</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yellow-400">🌍</span>
                  <span>{arabTopic ? arabTopic.countries.length : 22} دولة عربية متاحة للاحتلال</span>
                </li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-green-400/50"
            >
              🚀 ابدأ معركة الوطن العربي!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة انتهاء اللعبة
  if (gamePhase === 'finished') {
    // الفائز هو من لديه دول أكثر
    const winner = teams[0].conqueredCount > teams[1].conqueredCount ? teams[0] : 
                   teams[1].conqueredCount > teams[0].conqueredCount ? teams[1] : null;

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
              انتهت معركة الوطن العربي!
            </h1>

            {winner ? (
              <div className={`p-6 rounded-xl mb-6 ${
                winner.color === 'red' 
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-400/50'
                  : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-2 border-blue-400/50'
              }`}>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🏆 الفائز: {winner.name}
                </h2>
                <p className="text-xl text-white/80">
                  احتل {winner.conqueredCount} دولة عربية
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl mb-6 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/50">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🤝 تعادل!
                </h2>
                <p className="text-xl text-white/80">
                  كلا الفريقين احتل {teams[0].conqueredCount} دولة
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-red-400/50">
                <h3 className="text-xl font-bold text-white mb-2">{teams[0].name}</h3>
                <p className="text-3xl font-bold text-white">{teams[0].conqueredCount}</p>
                <p className="text-red-300 mt-2">دولة عربية محتلة</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border-2 border-blue-400/50">
                <h3 className="text-xl font-bold text-white mb-2">{teams[1].name}</h3>
                <p className="text-3xl font-bold text-white">{teams[1].conqueredCount}</p>
                <p className="text-blue-300 mt-2">دولة عربية محتلة</p>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              🔄 معركة جديدة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب الرئيسية
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            🌍 معركة الوطن العربي
          </h1>
          <div className="flex gap-3">
            {/* زر إنهاء يدوي للحالات الطارئة */}
            {arabTopic && occupiedCountries.length >= arabTopic.countries.length && (
              <button
                onClick={() => setGamePhase('finished')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300"
              >
                🏆 إعلان النتائج
              </button>
            )}
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* النتائج - عدد الدول المحتلة */}
<div className="grid grid-cols-2 gap-3 md:gap-6 mb-6">
            <div className={`p-4 md:p-6 rounded-2xl transition-all duration-300 ${
            currentTurn === 'red' 
              ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl shadow-red-500/25 ring-4 ring-red-400/50'
              : 'bg-gradient-to-br from-red-500/70 to-pink-500/70 shadow-lg'
          }`}>
<h2 className="text-lg md:text-2xl font-bold text-white mb-2 text-right">{teams[0].name}</h2>
            <p className="text-3xl md:text-4xl font-bold text-white text-right">{teams[0].conqueredCount}</p>
<p className="text-sm text-white/80 mt-2 text-right">دولة عربية محتلة</p>
          </div>
          
          <div className={`p-4 md:p-6 rounded-2xl transition-all duration-300 ${
            currentTurn === 'blue' 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-2xl shadow-blue-500/25 ring-4 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-500/70 to-indigo-500/70 shadow-lg'
          }`}>
<h2 className="text-lg md:text-2xl font-bold text-white mb-2 text-right">{teams[0].name}</h2>
            <p className="text-3xl md:text-4xl font-bold text-white text-right">{teams[1].conqueredCount}</p>
<p className="text-sm text-white/80 mt-2 text-right">دولة عربية محتلة</p>
          </div>
        </div>

        {/* مؤشر تقدم المعركة */}
        {arabTopic && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 mb-6 shadow-lg border border-slate-700">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">تقدم معركة الوطن العربي</h3>
              <div className="flex justify-center items-center gap-4 text-sm mb-3">
                <span className="text-green-400">محتلة: {occupiedCountries.length}</span>
                <span className="text-yellow-400">متبقية: {arabTopic.countries.length - occupiedCountries.length}</span>
                <span className="text-blue-400">المجموع: {arabTopic.countries.length}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(occupiedCountries.length / arabTopic.countries.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {occupiedCountries.length >= arabTopic.countries.length ? 
                  '🎊 كل الدول العربية محتلة! انتظر إعلان النتائج...' : 
                  `${Math.round((occupiedCountries.length / arabTopic.countries.length) * 100)}% مكتمل`
                }
              </p>
            </div>
          </div>
        )}

        {/* خريطة الوطن العربي */}
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