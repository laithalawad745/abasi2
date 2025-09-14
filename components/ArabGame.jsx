// components/ArabGame.jsx - التصميم الجديد مع الحفاظ على الوظائف الأصلية
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
    { name: 'الفريق الأحمر', color: 'red', conqueredCount: 0 },
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

  // تحديث تعداد الدول المحتلة لكل فريق
  useEffect(() => {
    setTeams(prevTeams => 
      prevTeams.map(team => ({
        ...team,
        conqueredCount: teamCountries[team.color]?.length || 0
      }))
    );
  }, [teamCountries]);

  // فحص دوري من انتهاء اللعبة
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

  // اختيار دولة - الكود الأصلي بالضبط
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

  // منح النقاط - الكود الأصلي بالضبط (مُحول لنظام احتلال الدول)
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

    // تحديث عدد الدول المحتلة للفريق (بدلاً من النقاط)
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

  // عدم وجود إجابة صحيحة - الكود الأصلي بالضبط
  const noCorrectWorldAnswer = () => {
    console.log('❌ تم الضغط على "لا أحد أجاب صح"');
    
    if (!currentWorldQuestion) {
      console.error('❌ لا يوجد سؤال حالي');
      return;
    }

    console.log('🔄 تغيير الدور فقط بدون احتلال أي دولة');
    console.log('الدور الحالي:', currentTurn, '→ الدور التالي:', currentTurn === 'red' ? 'blue' : 'red');

    // فقط تغيير الدور بدون احتلال الدولة
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

  // صفحة الإعداد - التصميم الجديد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                الوطن العربي
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
              معركة
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600">
                الوطن العربي
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
              اكتشف الأمة العربية واحتل دولها من المحيط إلى الخليج
            </p>
          </div>

          {/* قواعد اللعبة */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                   قواعد اللعبة
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-400 mb-2">اختيار الدولة</h3>
                      <p className="text-gray-300">اختر دولة عربية للإجابة على سؤال عشوائي عنها</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">⚔️</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-400 mb-2">الاحتلال</h3>
                      <p className="text-gray-300">إجابة صحيحة = تحتل الدولة وتضاف لمملكتك</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">❌</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-400 mb-2">الخطأ</h3>
                      <p className="text-gray-300">إجابة خاطئة = الدور للفريق الآخر بدون نقاط</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-400 mb-2">الفوز</h3>
                      <p className="text-gray-300">الفريق الذي يحتل دول عربية أكثر يفوز!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* إحصائيات */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold text-2xl">{arabTopic ? arabTopic.countries.length : 22}</div>
                    <div className="text-gray-400 text-sm">دولة عربية</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-bold text-2xl">2</div>
                    <div className="text-gray-400 text-sm">فريق متنافس</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-emerald-400 font-bold text-2xl">10</div>
                    <div className="text-gray-400 text-sm">نقطة لكل دولة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* زر البدء */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative px-12 py-6 rounded-3xl font-bold text-2xl transition-all duration-300 hover:scale-105 border-2 border-green-400/50 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  ابدأ معركة الوطن العربي!
                </div>
              </div>
            </button>
          </div>

          {/* معلومات إضافية */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center justify-center space-x-8 space-x-reverse bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>خريطة تفاعلية</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>ثقافة عربية</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span>من المحيط للخليج</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة انتهاء اللعبة - التصميم الجديد
  if (gamePhase === 'finished') {
    const winner = teams[0].conqueredCount > teams[1].conqueredCount ? teams[0] : 
                   teams[1].conqueredCount > teams[0].conqueredCount ? teams[1] : null;

    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden select-none">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                النتائج
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              
              {/* عنوان النتيجة */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl font-black mb-4">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                    🏆 انتهت معركة الوطن العربي!
                  </span>
                </h1>

                {winner ? (
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                    الفائز: {winner.name}! 🎊
                  </h2>
                ) : (
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                    تعادل عربي مشرف! 🤝
                  </h2>
                )}
              </div>

              {/* نتائج الفرق */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                  winner?.color === 'red' 
                    ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 ring-2 ring-red-400/50'
                    : winner?.color === 'blue' && teams[0].color === 'red'
                      ? 'bg-white/5 border-gray-500/30'
                      : 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30'
                }`}>
                  <div className="text-center">
                    <h3 className={`text-2xl font-bold mb-4 ${
                      winner?.color === 'red' ? 'text-red-400' : 'text-red-400'
                    }`}>
                      {winner?.color === 'red' ? '🥇' : winner ? '🥈' : '🏆'} {teams[0].name}
                    </h3>
                    <p className="text-4xl font-bold text-white mb-2">{teams[0].conqueredCount}</p>
                    <p className="text-xl text-gray-300">دولة عربية محتلة</p>
                  </div>
                </div>
                
                <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                  winner?.color === 'blue' 
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30 ring-2 ring-blue-400/50'
                    : winner?.color === 'red' && teams[1].color === 'blue'
                      ? 'bg-white/5 border-gray-500/30'
                      : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30'
                }`}>
                  <div className="text-center">
                    <h3 className={`text-2xl font-bold mb-4 ${
                      winner?.color === 'blue' ? 'text-blue-400' : 'text-blue-400'
                    }`}>
                      {winner?.color === 'blue' ? '🥇' : winner ? '🥈' : '🏆'} {teams[1].name}
                    </h3>
                    <p className="text-4xl font-bold text-white mb-2">{teams[1].conqueredCount}</p>
                    <p className="text-xl text-gray-300">دولة عربية محتلة</p>
                  </div>
                </div>
              </div>

              {/* زر إعادة اللعب */}
              <button
                onClick={resetGame}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105">
                  🔄 معركة عربية جديدة
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة اللعب الرئيسية - التصميم الجديد مع الوظائف الأصلية
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl md:text-3xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
              🌍 معركة الوطن العربي
            </span>
          </div>
          <div className="flex gap-3">
            {/* زر إنهاء يدوي للحالات الطارئة */}
            {arabTopic && occupiedCountries.length >= arabTopic.countries.length * 0.8 && (
              <button
                onClick={() => setGamePhase('finished')}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 rounded-xl font-semibold transition-all duration-300"
              >
                🏁 إنهاء اللعبة
              </button>
            )}
            
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* معلومات الدور الحالي */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
            <div className="text-center">
              <div className={`font-bold text-xl ${currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
                دور {currentTurn === 'red' ? teams[0].name : teams[1].name}
              </div>
              <div className="text-gray-400 text-sm">اختر دولة عربية للاحتلال</div>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">الهدف</div>
              <div className="text-gray-400 text-sm">احتلال أكبر عدد من الدول العربية</div>
            </div>
          </div>
        </div>

        {/* نقاط الفرق */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 bg-white/5 backdrop-blur-xl border rounded-3xl transition-all duration-300 ${
            currentTurn === 'red' 
              ? 'border-red-500/50 shadow-lg shadow-red-500/25 ring-2 ring-red-400/50'
              : 'border-white/10'
          }`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-red-400 mb-2">{teams[0].name}</h3>
              <p className="text-4xl font-bold text-white mb-2">{teams[0].conqueredCount}</p>
              <p className="text-gray-400">دولة عربية محتلة</p>
              {currentTurn === 'red' && (
                <div className="mt-3 text-red-300 text-sm animate-pulse">← دورك الآن</div>
              )}
            </div>
          </div>
          
          <div className={`p-6 bg-white/5 backdrop-blur-xl border rounded-3xl transition-all duration-300 ${
            currentTurn === 'blue' 
              ? 'border-blue-500/50 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50'
              : 'border-white/10'
          }`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-400 mb-2">{teams[1].name}</h3>
              <p className="text-4xl font-bold text-white mb-2">{teams[1].conqueredCount}</p>
              <p className="text-gray-400">دولة عربية محتلة</p>
              {currentTurn === 'blue' && (
                <div className="mt-3 text-blue-300 text-sm animate-pulse">← دورك الآن</div>
              )}
            </div>
          </div>
        </div>

        {/* مؤشر تقدم المعركة */}
        {arabTopic && (
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                   تقدم معركة الوطن العربي
                </span>
              </h3>
              <div className="flex justify-center items-center gap-6 text-lg mb-4">
                <span className="text-green-400 font-semibold">محتلة: {occupiedCountries.length}</span>
                <span className="text-yellow-400 font-semibold">متبقية: {arabTopic.countries.length - occupiedCountries.length}</span>
                <span className="text-blue-400 font-semibold">المجموع: {arabTopic.countries.length}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-4 rounded-full transition-all duration-500 shadow-lg shadow-green-400/25"
                  style={{ width: `${(occupiedCountries.length / arabTopic.countries.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {occupiedCountries.length >= arabTopic.countries.length ? 
                  '🎊 كل الدول العربية محتلة! المعركة انتهت!' : 
                  `${Math.round((occupiedCountries.length / arabTopic.countries.length) * 100)}% من الوطن العربي تم احتلاله`
                }
              </p>
            </div>
          </div>
        )}

        {/* الخريطة - نفس الكود الأصلي بالضبط */}
        <div className="mb-8">
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                 خريطة الوطن العربي التفاعلية
              </span>
            </h3>
            <div className="flex justify-center">
              {arabTopic && (
                <ArabMapD3 
                  arabTopic={arabTopic}
                  currentTurn={currentTurn}
                  occupiedCountries={occupiedCountries}
                  selectCountry={selectCountry}
                  teamCountries={teamCountries}
                />
              )}
            </div>
            {/* <p className="text-center text-gray-400 mt-4">
              اضغط على أي دولة عربية غير محتلة لبدء التحدي
            </p> */}
          </div>
        </div>

        {/* السؤال الحالي - نفس الكود الأصلي بالضبط */}
        <WorldQuestion 
          currentWorldQuestion={currentWorldQuestion}
          showWorldAnswer={showWorldAnswer}
          finishWorldAnswering={finishWorldAnswering}
          awardWorldPoints={awardWorldPoints}
          noCorrectWorldAnswer={noCorrectWorldAnswer}
        />

        {/* مودال الصورة */}
        <ImageModal 
          zoomedImage={zoomedImage} 
          closeZoomedImage={() => setZoomedImage(null)} 
        />
      </div>
    </div>
  );
}