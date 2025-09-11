// components/RiskGame/RiskGame.jsx - النسخة المحدثة مع جميع الدول وإصلاح منطق الهجوم
'use client';

import React, { useState, useEffect } from 'react';
import { getRandomRiskQuestion } from '../../app/data/riskGameData';

// Import components
import PlayerSetup from './PlayerSetup';
import SpinWheel from './SpinWheel';
import WorldMapD3 from './WorldMapD3';
import GameUI from './GameUI';
import QuestionModal from './QuestionModal';

export default function RiskGame() {
  // حالة اللعبة الأساسية
  const [gamePhase, setGamePhase] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnOrder, setTurnOrder] = useState([]);
  const [round, setRound] = useState(1);
  
  // حالة الخريطة والدول
  const [countries, setCountries] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // حالة العمليات
  const [actionType, setActionType] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [targetCountry, setTargetCountry] = useState(null);
  
  // 🆕 حالة اختيار مستوى السؤال
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // {type: 'occupy'|'reinforce'|'attack', data: {...}}

  // ألوان اللاعبين (ثابتة ومتطابقة مع WorldMapD3)
  const playerColors = [
    '#ff4444', // أحمر - لاعب 0
    '#4444ff', // أزرق - لاعب 1  
    '#44ff44', // أخضر - لاعب 2
    '#ffff44', // أصفر - لاعب 3
    '#ff44ff', // بنفسجي - لاعب 4
    '#44ffff', // سماوي - لاعب 5
    '#ff8844', // برتقالي - لاعب 6
    '#8844ff'  // بنفسجي غامق - لاعب 7
  ];

  // 🌍 تهيئة جميع دول العالم
  const initializeAllCountries = () => {
    const allWorldCountries = {
      // أمريكا الشمالية
      usa: { owner: null, troops: 0, name: 'الولايات المتحدة' },
      canada: { owner: null, troops: 0, name: 'كندا' },
      mexico: { owner: null, troops: 0, name: 'المكسيك' },
      greenland: { owner: null, troops: 0, name: 'جرينلاند' },
      guatemala: { owner: null, troops: 0, name: 'غواتيمالا' },
      cuba: { owner: null, troops: 0, name: 'كوبا' },
      
      // أمريكا الجنوبية
      brazil: { owner: null, troops: 0, name: 'البرازيل' },
      argentina: { owner: null, troops: 0, name: 'الأرجنتين' },
      peru: { owner: null, troops: 0, name: 'بيرو' },
      colombia: { owner: null, troops: 0, name: 'كولومبيا' },
      venezuela: { owner: null, troops: 0, name: 'فنزويلا' },
      chile: { owner: null, troops: 0, name: 'تشيلي' },
      bolivia: { owner: null, troops: 0, name: 'بوليفيا' },
      paraguay: { owner: null, troops: 0, name: 'باراغواي' },
      uruguay: { owner: null, troops: 0, name: 'أوروغواي' },
      ecuador: { owner: null, troops: 0, name: 'الإكوادور' },
      guyana: { owner: null, troops: 0, name: 'غيانا' },
      suriname: { owner: null, troops: 0, name: 'سورينام' },
      
      // أوروبا
      united_kingdom: { owner: null, troops: 0, name: 'المملكة المتحدة' },
      france: { owner: null, troops: 0, name: 'فرنسا' },
      germany: { owner: null, troops: 0, name: 'ألمانيا' },
      italy: { owner: null, troops: 0, name: 'إيطاليا' },
      spain: { owner: null, troops: 0, name: 'إسبانيا' },
      poland: { owner: null, troops: 0, name: 'بولندا' },
      ukraine: { owner: null, troops: 0, name: 'أوكرانيا' },
      russia: { owner: null, troops: 0, name: 'روسيا' },
      norway: { owner: null, troops: 0, name: 'النرويج' },
      sweden: { owner: null, troops: 0, name: 'السويد' },
      finland: { owner: null, troops: 0, name: 'فنلندا' },
      romania: { owner: null, troops: 0, name: 'رومانيا' },
      greece: { owner: null, troops: 0, name: 'اليونان' },
      turkey: { owner: null, troops: 0, name: 'تركيا' },
      belarus: { owner: null, troops: 0, name: 'بيلاروسيا' },
      czech_republic: { owner: null, troops: 0, name: 'التشيك' },
      austria: { owner: null, troops: 0, name: 'النمسا' },
      switzerland: { owner: null, troops: 0, name: 'سويسرا' },
      netherlands: { owner: null, troops: 0, name: 'هولندا' },
      belgium: { owner: null, troops: 0, name: 'بلجيكا' },
      denmark: { owner: null, troops: 0, name: 'الدنمارك' },
      portugal: { owner: null, troops: 0, name: 'البرتغال' },
      ireland: { owner: null, troops: 0, name: 'أيرلندا' },
      iceland: { owner: null, troops: 0, name: 'أيسلندا' },
      
      // آسيا
      china: { owner: null, troops: 0, name: 'الصين' },
      india: { owner: null, troops: 0, name: 'الهند' },
      japan: { owner: null, troops: 0, name: 'اليابان' },
      south_korea: { owner: null, troops: 0, name: 'كوريا الجنوبية' },
      north_korea: { owner: null, troops: 0, name: 'كوريا الشمالية' },
      thailand: { owner: null, troops: 0, name: 'تايلاند' },
      vietnam: { owner: null, troops: 0, name: 'فيتنام' },
      indonesia: { owner: null, troops: 0, name: 'إندونيسيا' },
      malaysia: { owner: null, troops: 0, name: 'ماليزيا' },
      philippines: { owner: null, troops: 0, name: 'الفلبين' },
      pakistan: { owner: null, troops: 0, name: 'باكستان' },
      iran: { owner: null, troops: 0, name: 'إيران' },
      iraq: { owner: null, troops: 0, name: 'العراق' },
      afghanistan: { owner: null, troops: 0, name: 'أفغانستان' },
      kazakhstan: { owner: null, troops: 0, name: 'كازاخستان' },
      uzbekistan: { owner: null, troops: 0, name: 'أوزبكستان' },
      mongolia: { owner: null, troops: 0, name: 'منغوليا' },
      myanmar: { owner: null, troops: 0, name: 'ميانمار' },
      laos: { owner: null, troops: 0, name: 'لاوس' },
      cambodia: { owner: null, troops: 0, name: 'كمبوديا' },
      bangladesh: { owner: null, troops: 0, name: 'بنغلاديش' },
      sri_lanka: { owner: null, troops: 0, name: 'سريلانكا' },
      nepal: { owner: null, troops: 0, name: 'نيبال' },
      bhutan: { owner: null, troops: 0, name: 'بوتان' },
      
      // الشرق الأوسط
      saudi_arabia: { owner: null, troops: 0, name: 'السعودية' },
      uae: { owner: null, troops: 0, name: 'الإمارات' },
      qatar: { owner: null, troops: 0, name: 'قطر' },
      kuwait: { owner: null, troops: 0, name: 'الكويت' },
      bahrain: { owner: null, troops: 0, name: 'البحرين' },
      oman: { owner: null, troops: 0, name: 'عمان' },
      yemen: { owner: null, troops: 0, name: 'اليمن' },
      jordan: { owner: null, troops: 0, name: 'الأردن' },
      lebanon: { owner: null, troops: 0, name: 'لبنان' },
      syria: { owner: null, troops: 0, name: 'سوريا' },
      israel: { owner: null, troops: 0, name: 'إسرائيل' },
      palestine: { owner: null, troops: 0, name: 'فلسطين' },
      cyprus: { owner: null, troops: 0, name: 'قبرص' },
      
      // أفريقيا
      egypt: { owner: null, troops: 0, name: 'مصر' },
      libya: { owner: null, troops: 0, name: 'ليبيا' },
      algeria: { owner: null, troops: 0, name: 'الجزائر' },
      morocco: { owner: null, troops: 0, name: 'المغرب' },
      tunisia: { owner: null, troops: 0, name: 'تونس' },
      sudan: { owner: null, troops: 0, name: 'السودان' },
      south_sudan: { owner: null, troops: 0, name: 'جنوب السودان' },
      ethiopia: { owner: null, troops: 0, name: 'إثيوبيا' },
      somalia: { owner: null, troops: 0, name: 'الصومال' },
      kenya: { owner: null, troops: 0, name: 'كينيا' },
      tanzania: { owner: null, troops: 0, name: 'تنزانيا' },
      uganda: { owner: null, troops: 0, name: 'أوغندا' },
      nigeria: { owner: null, troops: 0, name: 'نيجيريا' },
      south_africa: { owner: null, troops: 0, name: 'جنوب أفريقيا' },
      ghana: { owner: null, troops: 0, name: 'غانا' },
      ivory_coast: { owner: null, troops: 0, name: 'ساحل العاج' },
      cameroon: { owner: null, troops: 0, name: 'الكاميرون' },
      congo: { owner: null, troops: 0, name: 'الكونغو' },
      dr_congo: { owner: null, troops: 0, name: 'الكونغو الديمقراطية' },
      angola: { owner: null, troops: 0, name: 'أنغولا' },
      zambia: { owner: null, troops: 0, name: 'زامبيا' },
      zimbabwe: { owner: null, troops: 0, name: 'زيمبابوي' },
      botswana: { owner: null, troops: 0, name: 'بوتسوانا' },
      namibia: { owner: null, troops: 0, name: 'ناميبيا' },
      madagascar: { owner: null, troops: 0, name: 'مدغشقر' },
      
      // أوقيانوسيا
      australia: { owner: null, troops: 0, name: 'أستراليا' },
      new_zealand: { owner: null, troops: 0, name: 'نيوزيلندا' },
      papua_new_guinea: { owner: null, troops: 0, name: 'بابوا غينيا الجديدة' },
      fiji: { owner: null, troops: 0, name: 'فيجي' }
    };
    
    return allWorldCountries;
  };

  // خريطة الدول المجاورة الموسعة
  const adjacentCountries = {
    // أمريكا الشمالية
    usa: ['canada', 'mexico'],
    canada: ['usa', 'greenland'],
    mexico: ['usa', 'guatemala'],
    greenland: ['canada'],
    guatemala: ['mexico', 'cuba'],
    cuba: ['guatemala'],
    
    // أمريكا الجنوبية
    brazil: ['argentina', 'peru', 'colombia', 'bolivia', 'paraguay', 'uruguay', 'venezuela', 'guyana', 'suriname'],
    argentina: ['brazil', 'chile', 'bolivia', 'paraguay', 'uruguay'],
    peru: ['brazil', 'colombia', 'bolivia', 'ecuador', 'chile'],
    colombia: ['brazil', 'peru', 'venezuela', 'ecuador'],
    venezuela: ['brazil', 'colombia', 'guyana'],
    chile: ['argentina', 'peru', 'bolivia'],
    bolivia: ['brazil', 'argentina', 'peru', 'chile', 'paraguay'],
    paraguay: ['brazil', 'argentina', 'bolivia'],
    uruguay: ['brazil', 'argentina'],
    ecuador: ['peru', 'colombia'],
    guyana: ['brazil', 'venezuela', 'suriname'],
    suriname: ['brazil', 'guyana'],
    
    // أوروبا 
    united_kingdom: ['france', 'ireland'],
    france: ['united_kingdom', 'spain', 'italy', 'germany', 'belgium', 'switzerland'],
    germany: ['france', 'poland', 'czech_republic', 'austria', 'switzerland', 'netherlands', 'belgium', 'denmark'],
    italy: ['france', 'switzerland', 'austria', 'greece'],
    spain: ['france', 'portugal'],
    poland: ['germany', 'ukraine', 'belarus', 'czech_republic'],
    ukraine: ['poland', 'belarus', 'russia', 'romania', 'turkey'],
    russia: ['ukraine', 'belarus', 'finland', 'norway', 'mongolia', 'china', 'kazakhstan'],
    norway: ['sweden', 'finland', 'russia'],
    sweden: ['norway', 'finland', 'denmark'],
    finland: ['norway', 'sweden', 'russia'],
    romania: ['ukraine', 'turkey', 'greece'],
    greece: ['italy', 'romania', 'turkey'],
    turkey: ['ukraine', 'romania', 'greece', 'syria', 'iraq', 'iran'],
    belarus: ['poland', 'ukraine', 'russia'],
    czech_republic: ['poland', 'germany', 'austria'],
    austria: ['germany', 'italy', 'switzerland', 'czech_republic'],
    switzerland: ['france', 'italy', 'germany', 'austria'],
    netherlands: ['germany', 'belgium'],
    belgium: ['netherlands', 'germany', 'france'],
    denmark: ['germany', 'sweden'],
    portugal: ['spain'],
    ireland: ['united_kingdom'],
    iceland: [],
    
    // آسيا
    china: ['russia', 'mongolia', 'kazakhstan', 'pakistan', 'india', 'myanmar', 'laos', 'vietnam', 'north_korea'],
    india: ['china', 'pakistan', 'nepal', 'bhutan', 'bangladesh', 'myanmar', 'sri_lanka'],
    japan: ['south_korea'],
    south_korea: ['north_korea', 'japan'],
    north_korea: ['south_korea', 'china'],
    thailand: ['myanmar', 'laos', 'cambodia', 'malaysia'],
    vietnam: ['china', 'laos', 'cambodia'],
    indonesia: ['malaysia', 'papua_new_guinea'],
    malaysia: ['thailand', 'indonesia'],
    philippines: [],
    pakistan: ['china', 'india', 'afghanistan', 'iran'],
    iran: ['turkey', 'iraq', 'afghanistan', 'pakistan'],
    iraq: ['turkey', 'iran', 'syria', 'jordan', 'saudi_arabia', 'kuwait'],
    afghanistan: ['pakistan', 'iran', 'uzbekistan'],
    kazakhstan: ['russia', 'china', 'uzbekistan'],
    uzbekistan: ['kazakhstan', 'afghanistan'],
    mongolia: ['russia', 'china'],
    myanmar: ['china', 'india', 'bangladesh', 'laos', 'thailand'],
    laos: ['china', 'vietnam', 'thailand', 'cambodia', 'myanmar'],
    cambodia: ['vietnam', 'laos', 'thailand'],
    bangladesh: ['india', 'myanmar'],
    sri_lanka: ['india'],
    nepal: ['india', 'china'],
    bhutan: ['india', 'china'],
    
    // الشرق الأوسط
    saudi_arabia: ['iraq', 'jordan', 'yemen', 'oman', 'uae', 'qatar', 'kuwait'],
    uae: ['saudi_arabia', 'oman'],
    qatar: ['saudi_arabia'],
    kuwait: ['iraq', 'saudi_arabia'],
    bahrain: ['saudi_arabia'],
    oman: ['saudi_arabia', 'uae', 'yemen'],
    yemen: ['saudi_arabia', 'oman'],
    jordan: ['iraq', 'saudi_arabia', 'syria', 'israel', 'palestine'],
    lebanon: ['syria', 'israel'],
    syria: ['turkey', 'iraq', 'jordan', 'lebanon', 'israel'],
    israel: ['lebanon', 'syria', 'jordan', 'palestine', 'egypt'],
    palestine: ['israel', 'jordan'],
    cyprus: ['turkey'],
    
    // أفريقيا
    egypt: ['libya', 'sudan', 'israel'],
    libya: ['egypt', 'algeria', 'tunisia', 'sudan'],
    algeria: ['libya', 'tunisia', 'morocco'],
    morocco: ['algeria'],
    tunisia: ['libya', 'algeria'],
    sudan: ['egypt', 'libya', 'south_sudan', 'ethiopia'],
    south_sudan: ['sudan', 'ethiopia', 'uganda', 'kenya', 'dr_congo'],
    ethiopia: ['sudan', 'south_sudan', 'somalia', 'kenya'],
    somalia: ['ethiopia', 'kenya'],
    kenya: ['somalia', 'ethiopia', 'south_sudan', 'uganda', 'tanzania'],
    tanzania: ['kenya', 'uganda', 'zambia'],
    uganda: ['south_sudan', 'kenya', 'tanzania', 'dr_congo'],
    nigeria: ['cameroon'],
    south_africa: ['namibia', 'botswana', 'zimbabwe'],
    ghana: ['ivory_coast'],
    ivory_coast: ['ghana'],
    cameroon: ['nigeria', 'congo'],
    congo: ['cameroon', 'dr_congo', 'angola'],
    dr_congo: ['congo', 'angola', 'zambia', 'tanzania', 'uganda', 'south_sudan'],
    angola: ['congo', 'dr_congo', 'zambia', 'namibia'],
    zambia: ['angola', 'dr_congo', 'tanzania', 'zimbabwe', 'botswana', 'namibia'],
    zimbabwe: ['zambia', 'botswana', 'south_africa'],
    botswana: ['zambia', 'zimbabwe', 'south_africa', 'namibia'],
    namibia: ['angola', 'zambia', 'botswana', 'south_africa'],
    madagascar: [],
    
    // أوقيانوسيا
    australia: ['indonesia', 'papua_new_guinea'],
    new_zealand: [],
    papua_new_guinea: ['indonesia', 'australia'],
    fiji: []
  };

  // بدء اللعبة
  const startGame = (playerCount) => {
    const initialPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: `لاعب ${i + 1}`,
      color: playerColors[i],
      countries: [],
      totalTroops: 0,
      eliminated: false,
      isActive: true
    }));
    
    setPlayers(initialPlayers);
    setTurnOrder(initialPlayers.map(p => p.id));
    setCurrentPlayerIndex(0);
    setGamePhase('playing');
  };

  // تهيئة الدول عند بدء اللعبة
  useEffect(() => {
    if (gamePhase === 'playing') {
      const allCountries = initializeAllCountries();
      setCountries(allCountries);
      console.log('🌍 تم تهيئة جميع دول العالم:', Object.keys(allCountries).length, 'دولة');
    }
  }, [gamePhase]);

  // الحصول على اللاعب الحالي
  const getCurrentPlayer = () => {
    if (turnOrder.length === 0) {
      console.log('❌ turnOrder فارغ');
      return null;
    }
    
    if (currentPlayerIndex < 0 || currentPlayerIndex >= turnOrder.length) {
      console.log(`❌ currentPlayerIndex غير صحيح: ${currentPlayerIndex}, طول turnOrder: ${turnOrder.length}`);
      return null;
    }
    
    const playerId = turnOrder[currentPlayerIndex];
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
      console.log(`❌ لم يتم العثور على اللاعب بـ ID: ${playerId}`);
      return null;
    }
    
    if (player.eliminated) {
      console.log(`⚠️ اللاعب ${player.name} مقصى، الانتقال للتالي`);
      nextTurn();
      return null;
    }
    
    console.log(`✅ اللاعب الحالي: ${player.name} (ID: ${player.id}, Index: ${currentPlayerIndex})`);
    return player;
  };

  const currentPlayer = getCurrentPlayer();

  // 🆕 مهاجمة دولة - مع التحقق المحسن من عدد الجنود
  const attackCountry = (targetCountryId) => {
    const attackingCountryId = Object.keys(countries).find(id => 
      countries[id].owner === currentPlayer.id && 
      adjacentCountries[id]?.includes(targetCountryId)
    );
    
    if (!attackingCountryId) {
      alert('لا يوجد دولة مجاورة للهجوم منها!');
      return;
    }
    
    const attackingCountry = countries[attackingCountryId];
    const targetCountry = countries[targetCountryId];
    
    // 🔥 التحقق الصحيح من عدد الجنود
    if (attackingCountry.troops < 2) {
      alert('تحتاج على الأقل جنديين للهجوم!');
      return;
    }
    
    // التحقق من أن الدولة المهاجمة لديها جنود أكثر من المدافعة
    if (attackingCountry.troops <= targetCountry.troops) {
      alert(`لا يمكنك مهاجمة ${targetCountry.name} لأن لديك ${attackingCountry.troops} جنود فقط بينما لديهم ${targetCountry.troops} جنود!`);
      return;
    }
    
    setActionType('attack');
    setSelectedCountry(attackingCountryId);
    setTargetCountry(targetCountryId);
    
    // إظهار modal اختيار المستوى
    setPendingAction({
      type: 'attack',
      data: { targetCountryId, attackingCountryId }
    });
    setShowDifficultyModal(true);
  };

  // 🆕 تنفيذ الهجوم بالمستوى المختار
  const executeAttackCountry = (targetCountryId, attackingCountryId, difficulty) => {
    console.log(`⚔️ ${currentPlayer.name} يهاجم ${countries[targetCountryId].name} من ${countries[attackingCountryId].name} - مستوى ${difficulty}`);
    
    showRiskQuestion(difficulty, () => {
      const previousOwner = countries[targetCountryId].owner;
      
      console.log(`✅ نجح الهجوم! اللاعب ${currentPlayer.id} سيأخذ ${targetCountryId} من اللاعب ${previousOwner}`);
      
      // تحديث الدول
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[targetCountryId] = {
          ...newCountries[targetCountryId],
          owner: currentPlayer.id,
          troops: 15
        };
        return newCountries;
      });
      
      // تحديث قائمة اللاعبين
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        
        // إزالة الدولة من اللاعب السابق
        if (previousOwner !== null) {
          const prevOwnerIndex = newPlayers.findIndex(p => p.id === previousOwner);
          if (prevOwnerIndex !== -1) {
            newPlayers[prevOwnerIndex].countries = newPlayers[prevOwnerIndex].countries.filter(c => c !== targetCountryId);
            newPlayers[prevOwnerIndex].totalTroops -= countries[targetCountryId].troops;
          }
        }
        
        // إضافة الدولة للاعب الحالي
        const currentPlayerIndexInPlayers = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (currentPlayerIndexInPlayers !== -1) {
          if (!newPlayers[currentPlayerIndexInPlayers].countries.includes(targetCountryId)) {
            newPlayers[currentPlayerIndexInPlayers].countries.push(targetCountryId);
          }
          newPlayers[currentPlayerIndexInPlayers].totalTroops += 15;
        }
        
        return newPlayers;
      });
      
      alert(`⚔️ تم احتلال ${countries[targetCountryId].name} بنجاح!`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 1000);
      
    }, () => {
      // فشل الهجوم - خسارة 75%
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        const currentTroops = newCountries[attackingCountryId].troops;
        
        const troopsLost = Math.floor(currentTroops * 0.75);
        const newTroops = Math.max(1, currentTroops - troopsLost);
        newCountries[attackingCountryId].troops = newTroops;
        
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          const troopsLost = Math.floor(countries[attackingCountryId].troops * 0.75);
          newPlayers[playerIndex].totalTroops -= troopsLost;
        }
        return newPlayers;
      });
      
      alert(`💔 فشل الهجوم! خسرت 75% من جيش ${countries[attackingCountryId].name}`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 1000);
    });
  };

  // 🆕 تقوية دولة - عرض اختيار المستوى
  const reinforceCountry = (countryId) => {
    setActionType('reinforce');
    setSelectedCountry(countryId);
    
    // إظهار modal اختيار المستوى
    setPendingAction({
      type: 'reinforce',
      data: { countryId }
    });
    setShowDifficultyModal(true);
  };

  // 🆕 تنفيذ تقوية الدولة بالمستوى المختار
  const executeReinforceCountry = (countryId, difficulty) => {
    console.log(`💪 ${currentPlayer.name} يحاول تقوية ${countries[countryId].name} - مستوى ${difficulty}`);
    
    showRiskQuestion(difficulty, (selectedDifficulty) => {
      const troopsGained = getTroopsForDifficulty(selectedDifficulty);
      
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[countryId] = {
          ...newCountries[countryId],
          troops: newCountries[countryId].troops + troopsGained
        };
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          newPlayers[playerIndex].totalTroops += troopsGained;
        }
        return newPlayers;
      });
      
      alert(`💪 تمت تقوية ${countries[countryId].name} بـ ${troopsGained} جندي إضافي!`);
      setTimeout(() => {
        nextTurn();
      }, 1000);
    }, () => {
      // فشلت التقوية - خسارة 50%
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        const currentTroops = newCountries[countryId].troops;
        const troopsLost = Math.floor(currentTroops * 0.5);
        const newTroops = Math.max(1, currentTroops - troopsLost);
        newCountries[countryId].troops = newTroops;
        return newCountries;
      });
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id);
        if (playerIndex !== -1) {
          const troopsLost = Math.floor(countries[countryId].troops * 0.5);
          newPlayers[playerIndex].totalTroops -= troopsLost;
        }
        return newPlayers;
      });
      
      alert(`💔 خسرت 50% من جيش ${countries[countryId].name}`);
      
      setTimeout(() => {
        checkImmediateElimination();
        nextTurn();
      }, 1000);
    });
  };

  // 🆕 احتلال دولة فارغة - عرض اختيار المستوى
  const occupyCountry = (countryId, player) => {
    setActionType('occupy');
    setSelectedCountry(countryId);
    
    // إظهار modal اختيار المستوى
    setPendingAction({
      type: 'occupy',
      data: { countryId, player }
    });
    setShowDifficultyModal(true);
  };

  // 🆕 تنفيذ احتلال الدولة بالمستوى المختار
  const executeOccupyCountry = (countryId, player, difficulty) => {
    console.log(`🏴 ${player.name} (ID: ${player.id}) يحاول احتلال ${countries[countryId].name} - مستوى ${difficulty}`);
    
    showRiskQuestion(difficulty, (selectedDifficulty) => {
      const troopsGained = getTroopsForDifficulty(selectedDifficulty);
      
      console.log(`✅ نجح في الاحتلال! سيحصل على ${troopsGained} جندي`);
      
      // تحديث الدولة
      setCountries(prevCountries => {
        const newCountries = { ...prevCountries };
        newCountries[countryId] = {
          ...newCountries[countryId],
          owner: player.id,
          troops: troopsGained
        };
        return newCountries;
      });
      
      // تحديث بيانات اللاعب
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        const playerIndex = newPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          if (!newPlayers[playerIndex].countries.includes(countryId)) {
            newPlayers[playerIndex].countries.push(countryId);
          }
          newPlayers[playerIndex].totalTroops += troopsGained;
        }
        return newPlayers;
      });
      
      alert(`🎉 تم احتلال ${countries[countryId].name} بنجاح!`);
      
      setTimeout(() => {
        nextTurn();
      }, 1000);
      
    }, () => {
      // فشل الاحتلال
      alert(`💔 فشل في احتلال ${countries[countryId].name}!`);
      
      setTimeout(() => {
        nextTurn();
      }, 1000);
    });
  };

  // اختيار دولة
  const selectCountry = (countryId) => {
    const country = countries[countryId];
    if (!country) {
      console.log('❌ دولة غير معروفة:', countryId);
      return;
    }

    if (!currentPlayer) {
      console.log('❌ لا يوجد لاعب حالي');
      return;
    }

    console.log(`🎯 اللاعب ${currentPlayer.name} (ID: ${currentPlayer.id}) نقر على ${country.name} (مالك حالي: ${country.owner})`);
    
    if (country.owner === null) {
      // دولة فارغة - احتلال
      occupyCountry(countryId, currentPlayer);
    } else if (country.owner === currentPlayer.id) {
      // دولة مملوكة - تقوية
      reinforceCountry(countryId);
    } else {
      // دولة للعدو - هجوم
      const playerCountries = Object.keys(countries).filter(id => 
        countries[id].owner === currentPlayer.id
      );
      
      const canAttack = playerCountries.some(playerCountryId => 
        adjacentCountries[playerCountryId]?.includes(countryId)
      );
      
      if (canAttack) {
        attackCountry(countryId);
      } else {
        alert('يمكنك فقط مهاجمة الدول المجاورة لدولك!');
      }
    }
  };

  // 🆕 مكون اختيار مستوى السؤال
  const DifficultySelectionModal = () => {
    if (!showDifficultyModal || !pendingAction) return null;

    const handleDifficultySelect = (difficulty) => {
      setShowDifficultyModal(false);
      
      // تنفيذ الإجراء المؤجل مع المستوى المختار
      if (pendingAction.type === 'occupy') {
        executeOccupyCountry(pendingAction.data.countryId, pendingAction.data.player, difficulty);
      } else if (pendingAction.type === 'reinforce') {
        executeReinforceCountry(pendingAction.data.countryId, difficulty);
      } else if (pendingAction.type === 'attack') {
        executeAttackCountry(pendingAction.data.targetCountryId, pendingAction.data.attackingCountryId, difficulty);
      }
      
      setPendingAction(null);
    };

    const difficulties = [
      { 
        key: 'easy', 
        name: 'سهل', 
        troops: 5, 
        color: 'from-green-500 to-emerald-500', 
        description: 'فرصة نجاح عالية - مخاطرة منخفضة' 
      },
      { 
        key: 'medium', 
        name: 'متوسط', 
        troops: 10, 
        color: 'from-yellow-500 to-orange-500', 
        description: 'فرصة نجاح متوسطة - مخاطرة متوازنة' 
      },
      { 
        key: 'hard', 
        name: 'صعب', 
        troops: 20, 
        color: 'from-red-500 to-pink-500', 
        description: 'فرصة نجاح منخفضة - مخاطرة عالية' 
      }
    ];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
          <h3 className="text-white text-xl font-bold mb-4 text-center">اختر مستوى السؤال</h3>
          
          <div className="space-y-3">
            {difficulties.map(diff => (
              <button
                key={diff.key}
                onClick={() => handleDifficultySelect(diff.key)}
                className={`w-full p-4 rounded-xl bg-gradient-to-r ${diff.color} text-white font-bold hover:scale-105 transition-all duration-300`}
              >
                <div className="text-lg">{diff.name}</div>
                <div className="text-sm opacity-90">{diff.troops} جنود</div>
                <div className="text-xs opacity-75">{diff.description}</div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setShowDifficultyModal(false);
              setPendingAction(null);
            }}
            className="w-full mt-4 p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    );
  };

  // الحصول على جنود حسب مستوى الصعوبة
  const getTroopsForDifficulty = (difficulty) => {
    const troopsMap = { easy: 5, medium: 10, hard: 20 };
    return troopsMap[difficulty] || 5;
  };

  // عرض سؤال Risk
  const showRiskQuestion = (difficulty, onSuccess, onFailure) => {
    const question = getRandomRiskQuestion(difficulty);
    if (!question) {
      onFailure();
      return;
    }
    setCurrentQuestion(question);
  };

  // إجابة صحيحة
  const handleCorrectAnswer = () => {
    setCurrentQuestion(null);
    // النجاح
    if (pendingAction?.type === 'occupy') {
      executeOccupyCountry(
        pendingAction.data.countryId, 
        pendingAction.data.player, 
        'easy'
      );
    }
    // باقي المنطق حسب نوع العملية
  };

  // إجابة خاطئة
  const handleWrongAnswer = () => {
    setCurrentQuestion(null);
    // الفشل
    alert('إجابة خاطئة!');
    nextTurn();
  };

  // 🔥 فحص فوري للإقصاء
  const checkImmediateElimination = () => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      let eliminatedThisTurn = [];
      
      newPlayers.forEach(player => {
        if (!player.eliminated) {
          const playerCountries = Object.values(countries).filter(c => c.owner === player.id);
          
          if (playerCountries.length === 0) {
            player.eliminated = true;
            player.isActive = false;
            eliminatedThisTurn.push(player.name);
            console.log(`❌ تم إقصاء ${player.name} - لا يملك أي دولة!`);
          }
          else if (player.totalTroops < 3) {
            player.eliminated = true;
            player.isActive = false;
            eliminatedThisTurn.push(player.name);
            console.log(`❌ تم إقصاء ${player.name} - جيش ضعيف جداً!`);
            
            // تحرير دوله وجعلها محايدة ضعيفة
            playerCountries.forEach(country => {
              const countryId = Object.keys(countries).find(id => countries[id] === country);
              if (countryId) {
                setCountries(prev => ({
                  ...prev,
                  [countryId]: { ...prev[countryId], owner: null, troops: 1 }
                }));
              }
            });
          }
        }
      });
      
      if (eliminatedThisTurn.length > 0) {
        const activePlayers = newPlayers.filter(p => !p.eliminated);
        const newTurnOrder = activePlayers.map(p => p.id);
        setTurnOrder(newTurnOrder);
        
        if (newTurnOrder.length > 0) {
          const newIndex = Math.min(currentPlayerIndex, newTurnOrder.length - 1);
          setCurrentPlayerIndex(newIndex);
        }
        
        alert(`🔥 تم إقصاء: ${eliminatedThisTurn.join(', ')}!`);
      }
      
      return newPlayers;
    });
  };

  // الانتقال للدور التالي
  const nextTurn = () => {
    const nextIndex = (currentPlayerIndex + 1) % turnOrder.length;
    setCurrentPlayerIndex(nextIndex);
    setRound(round + 1);
    
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
  };

  // إنهاء الدور يدوياً
  const endTurn = () => {
    nextTurn();
  };

  // إعادة تشغيل اللعبة
  const restartGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setCountries({});
    setCurrentPlayerIndex(0);
    setTurnOrder([]);
    setRound(1);
    setCurrentQuestion(null);
    setActionType(null);
    setSelectedCountry(null);
    setTargetCountry(null);
    setShowDifficultyModal(false);
    setPendingAction(null);
  };

  // التحقق من انتهاء اللعبة
  useEffect(() => {
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length === 1 && players.length > 1) {
      setTimeout(() => {
        alert(`🎉 اللعبة انتهت! الفائز هو: ${activePlayers[0].name}`);
        setGamePhase('finished');
      }, 1000);
    }
  }, [players]);

  // عرض مراحل اللعبة المختلفة
  if (gamePhase === 'setup') {
    return <PlayerSetup onSetupComplete={startGame} />;
  }

  if (gamePhase === 'finished') {
    const winner = players.find(p => !p.eliminated);
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-3xl p-8 border border-slate-600 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">🎉 انتهت اللعبة!</h1>
          <h2 className="text-2xl font-bold text-white mb-6">الفائز: {winner?.name}</h2>
          <button
            onClick={restartGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-xl w-full transition-all duration-300 shadow-lg"
          >
            لعبة جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      {/* واجهة اللعبة */}
      <GameUI 
        currentPlayer={currentPlayer}
        players={players}
        countries={countries}
        gamePhase={gamePhase}
        round={round}
        onEndTurn={endTurn}
        onRestart={restartGame}
      />
      
      {/* الخريطة */}
      <WorldMapD3 
        countries={countries}
        onCountryClick={selectCountry}
        currentPlayer={currentPlayer}
        actionType={actionType}
      />
      
      {/* Modal اختيار مستوى السؤال */}
      <DifficultySelectionModal />
      
      {/* Modal السؤال */}
      {currentQuestion && (
        <QuestionModal 
          question={currentQuestion}
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
          onClose={() => setCurrentQuestion(null)}
        />
      )}
    </div>
  );
}