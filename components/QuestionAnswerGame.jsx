// components/QuestionAnswerGame.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageModal, ConfirmModal } from './Modals';
import ToastNotification, { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './ToastNotification';

// 8 أنواع الأسئلة المتاحة
const questionTypes = [
  { id: 'cars', name: 'سيارات', icon: '🚗', color: 'from-red-500 to-red-600' },
  { id: 'history', name: 'تاريخ', icon: '🏛️', color: 'from-amber-500 to-orange-600' },
  { id: 'geography', name: 'جغرافيا', icon: '🌍', color: 'from-green-500 to-green-600' },
  { id: 'series', name: 'مسلسلات', icon: '📺', color: 'from-purple-500 to-purple-600' },
  { id: 'sports', name: 'رياضة', icon: '⚽', color: 'from-blue-500 to-blue-600' },
  { id: 'science', name: 'علوم', icon: '🔬', color: 'from-cyan-500 to-cyan-600' },
  { id: 'food', name: 'طعام', icon: '🍕', color: 'from-yellow-500 to-yellow-600' },
  { id: 'technology', name: 'تكنولوجيا', icon: '💻', color: 'from-indigo-500 to-indigo-600' }
];

// بيانات الأسئلة الكاملة
const questionAnswerData = {
  cars: {
    name: 'سيارات',
    questions: [
      // أسئلة سهلة (100 نقطة)
      {
        id: 'cars_easy_1',
        question: 'ما هي أشهر شركة سيارات في اليابان؟',
        answer: 'تويوتا',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_easy_2',
        question: 'ما هو لون إشارة المرور التي تعني "قف"؟',
        answer: 'الأحمر',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_easy_3',
        question: 'كم عدد العجلات في السيارة العادية؟',
        answer: '4 عجلات',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة (200 نقطة)
      {
        id: 'cars_medium_1',
        question: 'ما هو نوع الوقود الذي تستخدمه سيارة تسلا؟',
        answer: 'الكهرباء',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_medium_2',
        question: 'في أي دولة تم تأسيس شركة BMW؟',
        answer: 'ألمانيا',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_medium_3',
        question: 'ما اسم أول سيارة أنتجتها شركة فورد بكميات كبيرة؟',
        answer: 'فورد موديل T',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة (300 نقطة)
      {
        id: 'cars_hard_1',
        question: 'ما هو اسم أسرع سيارة إنتاج في العالم حتى 2024؟',
        answer: 'بوجاتي شيرون سوبر سبورت',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_hard_2',
        question: 'في أي عام تم إنتاج أول سيارة في التاريخ؟',
        answer: '1885-1886 (كارل بنز)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_hard_3',
        question: 'ما هو الاسم الكامل لشركة BMW؟',
        answer: 'Bayerische Motoren Werke (مصانع المحركات البافارية)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },
  geography: {
    name: 'جغرافيا',
    questions: [
      // أسئلة سهلة
      {
        id: 'geography_easy_1',
        question: 'ما هي عاصمة المملكة العربية السعودية؟',
        answer: 'الرياض',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_easy_2',
        question: 'كم عدد قارات العالم؟',
        answer: '7 قارات',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_easy_3',
        question: 'أين يقع نهر النيل؟',
        answer: 'في أفريقيا (مصر والسودان)',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة
      {
        id: 'geography_medium_1',
        question: 'ما هو أطول نهر في العالم؟',
        answer: 'نهر النيل',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_medium_2',
        question: 'في أي دولة توجد صحراء أتاكاما؟',
        answer: 'تشيلي',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_medium_3',
        question: 'ما هي عاصمة أستراليا؟',
        answer: 'كانبيرا',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة
      {
        id: 'geography_hard_1',
        question: 'ما هو أعلى جبل في أفريقيا؟',
        answer: 'جبل كليمنجارو',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_hard_2',
        question: 'في أي مضيق يلتقي المحيط الأطلسي بالمتوسط؟',
        answer: 'مضيق جبل طارق',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_hard_3',
        question: 'ما هي أصغر دولة في العالم من حيث المساحة؟',
        answer: 'الفاتيكان',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },
  history: {
    name: 'تاريخ',
    questions: [
      // أسئلة سهلة
      {
        id: 'history_easy_1',
        question: 'في أي عام توحدت المملكة العربية السعودية؟',
        answer: '1932',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_easy_2',
        question: 'من هو النبي الذي بُعث لقوم عاد؟',
        answer: 'النبي هود عليه السلام',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_easy_3',
        question: 'ما اسم الخليفة الأول بعد النبي محمد؟',
        answer: 'أبو بكر الصديق',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة
      {
        id: 'history_medium_1',
        question: 'في أي معركة انتصر المسلمون على الفرس نهائياً؟',
        answer: 'معركة القادسية',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_medium_2',
        question: 'من هو الخليفة الذي أسس مدينة بغداد؟',
        answer: 'أبو جعفر المنصور',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_medium_3',
        question: 'في أي عام انتهت الحرب العالمية الثانية؟',
        answer: '1945',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة
      {
        id: 'history_hard_1',
        question: 'في أي عام سقطت الأندلس؟',
        answer: '1492',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_hard_2',
        question: 'من هو مؤسس الدولة الأموية في الأندلس؟',
        answer: 'عبد الرحمن الداخل (صقر قريش)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_hard_3',
        question: 'من هو آخر خلفاء بني العباس في بغداد؟',
        answer: 'المستعصم بالله',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },
  series: {
    name: 'مسلسلات',
    questions: [
      // أسئلة سهلة
      {
        id: 'series_easy_1',
        question: 'من هو بطل مسلسل "باب الحارة"؟',
        answer: 'أبو عصام (قصي خولي)',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_easy_2',
        question: 'في أي مدينة تدور أحداث مسلسل "باب الحارة"؟',
        answer: 'دمشق القديمة',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_easy_3',
        question: 'من هو بطل مسلسل "عمر بن الخطاب"؟',
        answer: 'سامر إسماعيل',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة
      {
        id: 'series_medium_1',
        question: 'من أخرج مسلسل "الزير سالم"؟',
        answer: 'حاتم علي',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_medium_2',
        question: 'كم موسم من مسلسل Game of Thrones؟',
        answer: '8 مواسم',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_medium_3',
        question: 'من بطل مسلسل "العراب نور الشريف"؟',
        answer: 'نور الشريف',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة
      {
        id: 'series_hard_1',
        question: 'من ألف نص مسلسل "التغريبة الفلسطينية"؟',
        answer: 'وليد سيف',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_hard_2',
        question: 'كم عدد حلقات مسلسل "عمر بن عبد العزيز"؟',
        answer: '30 حلقة',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_hard_3',
        question: 'من أخرج مسلسل "خالد بن الوليد"؟',
        answer: 'محمد عزيزية',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },
  sports: {
    name: 'رياضة',
    questions: [
      // أسئلة سهلة
      {
        id: 'sports_easy_1',
        question: 'كم عدد لاعبي فريق كرة القدم في الملعب؟',
        answer: '11 لاعب',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_easy_2',
        question: 'في أي مدينة سعودية يقع نادي الهلال؟',
        answer: 'الرياض',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_easy_3',
        question: 'كم مرة فازت البرازيل بكأس العالم؟',
        answer: '5 مرات',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة
      {
        id: 'sports_medium_1',
        question: 'من هو هداف كأس العالم 2018؟',
        answer: 'هاري كين (إنجلترا)',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_medium_2',
        question: 'في أي عام فاز الأهلي السعودي بكأس آسيا؟',
        answer: '1986',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_medium_3',
        question: 'كم عدد بطولات دوري أبطال أوروبا لريال مدريد؟',
        answer: '14 بطولة',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة
      {
        id: 'sports_hard_1',
        question: 'من هو أول لاعب سعودي يلعب في الدوري الإنجليزي؟',
        answer: 'سامي الجابر',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_hard_2',
        question: 'في أي عام تأسس نادي الهلال؟',
        answer: '1957',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_hard_3',
        question: 'من هو أكثر لاعب تسجيلاً للأهداف في تاريخ كأس العالم؟',
        answer: 'ميروسلاف كلوزه (16 هدف)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },
  science: {
    name: 'علوم',
    questions: [
      // أسئلة سهلة
      {
        id: 'science_easy_1',
        question: 'كم عدد كواكب المجموعة الشمسية؟',
        answer: '8 كواكب',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_easy_2',
        question: 'ما هو أقرب كوكب للشمس؟',
        answer: 'عطارد',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_easy_3',
        question: 'ما هي درجة غليان الماء؟',
        answer: '100 درجة مئوية',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة
      {
        id: 'science_medium_1',
        question: 'ما هو أكبر عضو في جسم الإنسان؟',
        answer: 'الجلد',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_medium_2',
        question: 'ما هو الرمز الكيميائي للذهب؟',
        answer: 'Au',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_medium_3',
        question: 'ما اسم العملية التي تحول النباتات الضوء إلى طاقة؟',
        answer: 'البناء الضوئي',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة
      {
        id: 'science_hard_1',
        question: 'ما هو اسم الجسيم الذي اكتُشف في مصادم الهادرونات الكبير؟',
        answer: 'بوزون هيجز',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_hard_2',
        question: 'ما هو نصف عمر الكربون المشع C-14؟',
        answer: '5730 سنة',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_hard_3',
        question: 'كم تبلغ سرعة الضوء في الفراغ؟',
        answer: '299,792,458 متر في الثانية',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },
  food: {
    name: 'طعام',
    questions: [
      // أسئلة سهلة
      {
        id: 'food_easy_1',
        question: 'ما هو المكون الأساسي في طبق الحمص؟',
        answer: 'الحمص المسلوق',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_easy_2',
        question: 'من أي دولة تأتي البيتزا؟',
        answer: 'إيطاليا',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_easy_3',
        question: 'ما هو الطبق الوطني للسعودية؟',
        answer: 'الكبسة',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة
      {
        id: 'food_medium_1',
        question: 'ما هو المكون الرئيسي في طبق الغواكامولي؟',
        answer: 'الأفوكادو',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_medium_2',
        question: 'من أي نبات يُستخرج السكر الأبيض؟',
        answer: 'قصب السكر أو الشمندر السكري',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_medium_3',
        question: 'ما هو أغلى نوع توابل في العالم؟',
        answer: 'الزعفران',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة
      {
        id: 'food_hard_1',
        question: 'ما هو اسم الفطر الأغلى في العالم؟',
        answer: 'الكمأة البيضاء (التروفل)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_hard_2',
        question: 'ما هو المكون الذي يعطي الطعم الحار للفلفل؟',
        answer: 'الكابسايسين',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_hard_3',
        question: 'كم عدد السعرات الحرارية في جرام واحد من الدهون؟',
        answer: '9 سعرات حرارية',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },
  technology: {
    name: 'تكنولوجيا',
    questions: [
      // أسئلة سهلة
      {
        id: 'tech_easy_1',
        question: 'من مؤسس شركة أبل؟',
        answer: 'ستيف جوبز',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_easy_2',
        question: 'ماذا يعني اختصار WiFi؟',
        answer: 'Wireless Fidelity',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_easy_3',
        question: 'ما هو أكثر محرك بحث استخداماً في العالم؟',
        answer: 'جوجل',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة متوسطة
      {
        id: 'tech_medium_1',
        question: 'ما هو اسم مساعد أمازون الصوتي؟',
        answer: 'أليكسا',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_medium_2',
        question: 'من اخترع الشبكة العنكبوتية (World Wide Web)؟',
        answer: 'تيم بيرنرز لي',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_medium_3',
        question: 'أي شركة طورت نظام تشغيل أندرويد؟',
        answer: 'جوجل',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      // أسئلة صعبة
      {
        id: 'tech_hard_1',
        question: 'ما هو اسم أول كمبيوتر إلكتروني في التاريخ؟',
        answer: 'ENIAC',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_hard_2',
        question: 'من هو مؤسس شركة مايكروسوفت مع بيل جيتس؟',
        answer: 'بول ألين',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_hard_3',
        question: 'كم عدد البتات في البايت الواحد؟',
        answer: '8 بتات',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  }
};

export default function QuestionAnswerGame() {
  // حالة اللعبة
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, finished
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('red');
  const [teams, setTeams] = useState([
    { name: 'الفريق الأحمر', color: 'red', score: 0 },
    { name: 'الفريق الأزرق', color: 'blue', score: 0 }
  ]);

  // حالة الأسئلة
  const [teamQuestionMap, setTeamQuestionMap] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState(new Set());

  // حالة UI
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Timer State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Local Storage Keys
  const STORAGE_KEYS = {
    selectedTypes: 'qa-game-selected-types',
    usedQuestions: 'qa-game-used-questions',
    teamQuestionMap: 'qa-game-team-question-map',
    teams: 'qa-game-teams',
    currentTurn: 'qa-game-current-turn',
    gamePhase: 'qa-game-phase'
  };

  // تحميل البيانات من localStorage
  useEffect(() => {
    try {
      const savedPhase = localStorage.getItem(STORAGE_KEYS.gamePhase);
      const savedSelectedTypes = localStorage.getItem(STORAGE_KEYS.selectedTypes);
      const savedUsedQuestions = localStorage.getItem(STORAGE_KEYS.usedQuestions);
      const savedTeamQuestionMap = localStorage.getItem(STORAGE_KEYS.teamQuestionMap);
      const savedTeams = localStorage.getItem(STORAGE_KEYS.teams);
      const savedCurrentTurn = localStorage.getItem(STORAGE_KEYS.currentTurn);

      if (savedPhase) setGamePhase(savedPhase);
      if (savedSelectedTypes) setSelectedTypes(JSON.parse(savedSelectedTypes));
      if (savedUsedQuestions) setUsedQuestions(new Set(JSON.parse(savedUsedQuestions)));
      if (savedTeamQuestionMap) setTeamQuestionMap(JSON.parse(savedTeamQuestionMap));
      if (savedTeams) setTeams(JSON.parse(savedTeams));
      if (savedCurrentTurn) setCurrentTurn(savedCurrentTurn);
    } catch (error) {
      console.error('خطأ في تحميل البيانات من localStorage:', error);
    }
  }, []);

  // حفظ البيانات في localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.gamePhase, gamePhase);
      localStorage.setItem(STORAGE_KEYS.selectedTypes, JSON.stringify(selectedTypes));
      localStorage.setItem(STORAGE_KEYS.usedQuestions, JSON.stringify([...usedQuestions]));
      localStorage.setItem(STORAGE_KEYS.teamQuestionMap, JSON.stringify(teamQuestionMap));
      localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
      localStorage.setItem(STORAGE_KEYS.currentTurn, currentTurn);
    } catch (error) {
      console.error('خطأ في حفظ البيانات في localStorage:', error);
    }
  }, [gamePhase, selectedTypes, usedQuestions, teamQuestionMap, teams, currentTurn]);

  // Timer Effect
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerActive]);

  // دوال التحكم بالتوقيت
  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimer(0);
    setTimerActive(false);
  };

  // تحويل الثواني إلى تنسيق mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // دالة زووم الصورة
  const zoomImage = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  // تحديد الأنواع المختارة (6 من 8)
  const toggleTypeSelection = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
      showInfoToast(`تم إلغاء اختيار ${questionTypes.find(t => t.id === typeId).name}`);
    } else if (selectedTypes.length < 6) {
      setSelectedTypes([...selectedTypes, typeId]);
      // showSuccessToast(`تم اختيار ${questionTypes.find(t => t.id === typeId).name}`);
    } else {
      showErrorToast('يمكنك اختيار 6 أنواع أسئلة فقط!');
    }
  };

  // بدء اللعبة
  const startGame = () => {
    if (selectedTypes.length !== 6) {
      showErrorToast('يجب اختيار 6 أنواع أسئلة بالضبط!');
      return;
    }

    // إعداد خريطة الأسئلة
    const initialMap = {};
    selectedTypes.forEach(typeId => {
      initialMap[typeId] = {
        red: { easy: false, medium: false, hard: false },
        blue: { easy: false, medium: false, hard: false }
      };
    });
    
    setTeamQuestionMap(initialMap);
    setGamePhase('playing');
    showSuccessToast('تم بدء اللعبة! حظاً موفقاً 🎮');
  };

  // الحصول على سؤال عشوائي
  const getRandomQuestion = (typeId, difficulty) => {
    if (!questionAnswerData[typeId]) {
      console.error(`No data found for type: ${typeId}`);
      return null;
    }

    const questionsOfType = questionAnswerData[typeId].questions || [];
    const usedQuestionIds = Array.from(usedQuestions);
    const availableQuestions = questionsOfType.filter(q => 
      q.difficulty === difficulty && !usedQuestionIds.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  };

  // اختيار سؤال
  const selectQuestion = (typeId, team, difficulty) => {
    if (team !== currentTurn) {
      showErrorToast(`ليس دور الفريق ${team === 'red' ? 'الأحمر' : 'الأزرق'} الآن!`);
      return;
    }

    if (currentQuestion) {
      showErrorToast('يجب الانتهاء من السؤال الحالي أولاً!');
      return;
    }

    if (teamQuestionMap[typeId]?.[team]?.[difficulty]) {
      showErrorToast('تم الإجابة على هذا السؤال من قبل!');
      return;
    }

    // الحصول على سؤال عشوائي
    const randomQuestion = getRandomQuestion(typeId, difficulty);
    
    if (!randomQuestion) {
      showErrorToast(`لا توجد أسئلة ${difficulty === 'easy' ? 'سهلة' : difficulty === 'medium' ? 'متوسطة' : 'صعبة'} متاحة في ${questionTypes.find(t => t.id === typeId).name}!`);
      return;
    }

    const points = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 600;

    setCurrentQuestion({
      ...randomQuestion,
      typeId,
      team,
      difficulty,
      points
    });
    setShowAnswer(false);
    showInfoToast(`تم اختيار سؤال ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'} في ${questionTypes.find(t => t.id === typeId).name}`);
  };

  // إضافة نقاط وإغلاق السؤال
  const addPoints = (points, teamWhoAnswered) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.color === teamWhoAnswered 
          ? { ...team, score: team.score + points }
          : team
      )
    );
    showSuccessToast(`🎉 تم إضافة ${points} نقطة للفريق ${teamWhoAnswered === 'red' ? 'الأحمر' : 'الأزرق'}!`);
    closeQuestion();
  };

  // إغلاق السؤال
  const closeQuestion = () => {
    if (currentQuestion) {
      // إضافة السؤال للأسئلة المستخدمة
      setUsedQuestions(prev => new Set([...prev, currentQuestion.id]));

      // تحديث خريطة الأسئلة
      setTeamQuestionMap(prev => ({
        ...prev,
        [currentQuestion.typeId]: {
          ...prev[currentQuestion.typeId],
          [currentQuestion.team]: {
            ...prev[currentQuestion.typeId][currentQuestion.team],
            [currentQuestion.difficulty]: true
          }
        }
      }));
    }
    
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  // فحص إذا انتهت اللعبة
  const isGameFinished = () => {
    if (!teamQuestionMap || selectedTypes.length === 0) return false;
    
    return selectedTypes.every(typeId => 
      teamQuestionMap[typeId] &&
      ['easy', 'medium', 'hard'].every(difficulty =>
        teamQuestionMap[typeId]['red'][difficulty] && 
        teamQuestionMap[typeId]['blue'][difficulty]
      )
    );
  };

  // إعادة تعيين اللعبة
  const resetGame = () => {
    setGamePhase('setup');
    setSelectedTypes([]);
    setTeams([
      { name: 'الفريق الأحمر', color: 'red', score: 0 },
      { name: 'الفريق الأزرق', color: 'blue', score: 0 }
    ]);
    setTeamQuestionMap({});
    setCurrentQuestion(null);
    setCurrentTurn('red');
    setShowAnswer(false);
    setUsedQuestions(new Set());
    setShowConfirmReset(false);
    resetTimer();

    // مسح localStorage
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('خطأ في مسح localStorage:', error);
    }

    showInfoToast('تم إعادة تعيين اللعبة بنجاح!');
  };

  useEffect(() => {
    if (gamePhase === 'playing' && isGameFinished()) {
      setGamePhase('finished');
      showSuccessToast('🎉 انتهت اللعبة! تحقق من النتائج');
    }
  }, [teamQuestionMap, gamePhase]);

  // مرحلة الإعداد
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                ABSI
              </span>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              ← الرئيسية
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              فقرة
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                سؤال و جواب
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-6">اختر 6 أنواع أسئلة من أصل 8</p>
            <div className="text-lg text-yellow-400 font-bold">
              المختار: {selectedTypes.length}/6
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {questionTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleTypeSelection(type.id)}
                  disabled={!selectedTypes.includes(type.id) && selectedTypes.length >= 6}
                  className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    selectedTypes.includes(type.id)
                      ? `bg-gradient-to-br ${type.color} text-white shadow-lg border-2 border-white/30`
                      : selectedTypes.length >= 6
                      ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-bold">{type.name}</div>
                  {selectedTypes.includes(type.id) && (
                    <div className="text-xs mt-1 opacity-80">✓ مختار</div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={startGame}
                disabled={selectedTypes.length !== 6}
                className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 ${
                  selectedTypes.length === 6
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 shadow-lg'
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                🎮 بدء اللعبة
              </button>
            </div>
          </div>
        </div>

        <ToastNotification />
      </div>
    );
  }

  // مرحلة اللعب
  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl md:text-3xl font-black text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                سؤال و جواب
              </span>
            </div>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
            >
              🔄 إعادة تعيين
            </button>
          </div>

          {/* Timer وعرض النقاط */}
          <div className="flex justify-center items-center gap-4 mb-8">
            {/* Timer */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3">
              <div className="text-3xl font-bold text-white">{formatTime(timer)}</div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTimer}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                    timerActive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {timerActive ? '⏸️ إيقاف' : '▶️ تشغيل'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all duration-300"
                >
                  🔄 إعادة
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* الفريق الأحمر */}
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-red-400/30 rounded-3xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-red-300 mb-2">الفريق الأحمر</h3>
                <div className="text-4xl font-black text-white">{teams[0].score}</div>
              </div>
            </div>

            {/* الفريق الأزرق */}
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-300 mb-2">الفريق الأزرق</h3>
                <div className="text-4xl font-black text-white">{teams[1].score}</div>
              </div>
            </div>
          </div>

          {/* لوحة الأسئلة - عنوان الفئة مرة واحدة في المنتصف */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedTypes.map(typeId => {
                const type = questionTypes.find(t => t.id === typeId);
                return (
                  <div key={typeId} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

                    <div className="grid grid-cols-3 gap-4">
                      {/* العمود الأيسر - أسئلة الأحمر */}
                      <div className="space-y-4">
                        <button
                          onClick={() => selectQuestion(typeId, 'red', 'easy')}
                          disabled={teamQuestionMap[typeId]?.red?.easy || currentQuestion}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.red?.easy
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion
                              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg'
                              : 'bg-red-300/30 text-red-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.red?.easy ? '✓' : '200'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'red', 'medium')}
                          disabled={teamQuestionMap[typeId]?.red?.medium || currentQuestion}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.red?.medium
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion
                              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg'
                              : 'bg-red-300/30 text-red-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.red?.medium ? '✓' : '400'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'red', 'hard')}
                          disabled={teamQuestionMap[typeId]?.red?.hard || currentQuestion}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.red?.hard
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion
                              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg'
                              : 'bg-red-300/30 text-red-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.red?.hard ? '✓' : '600'}
                        </button>
                      </div>

                      {/* العمود الأوسط - عنوان الفئة */}
                      <div className="flex items-center justify-center">
                        <div className={`bg-gradient-to-br ${type.color} rounded-2xl p-4 text-center shadow-lg h-full flex flex-col justify-center min-h-[200px]`}>
                          <div className="text-4xl mb-3">{type.icon}</div>
                          <div className="text-white font-bold text-lg">{type.name}</div>
                        </div>
                      </div>

                      {/* العمود الأيمن - أسئلة الأزرق */}
                      <div className="space-y-4">
                        <button
                          onClick={() => selectQuestion(typeId, 'blue', 'easy')}
                          disabled={teamQuestionMap[typeId]?.blue?.easy || currentQuestion}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.blue?.easy
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                              : 'bg-blue-300/30 text-blue-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.blue?.easy ? '✓' : '200'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'blue', 'medium')}
                          disabled={teamQuestionMap[typeId]?.blue?.medium || currentQuestion}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.blue?.medium
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                              : 'bg-blue-300/30 text-blue-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.blue?.medium ? '✓' : '400'}
                        </button>
                        
                        <button
                          onClick={() => selectQuestion(typeId, 'blue', 'hard')}
                          disabled={teamQuestionMap[typeId]?.blue?.hard || currentQuestion}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                            teamQuestionMap[typeId]?.blue?.hard
                              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                              : !currentQuestion
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                              : 'bg-blue-300/30 text-blue-200 cursor-not-allowed'
                          }`}
                        >
                          {teamQuestionMap[typeId]?.blue?.hard ? '✓' : '600'}
                        </button>
                      </div>
                    </div>

                    {/* مؤشر التقدم لهذه الفئة */}
                    <div className="text-center mt-4">
                      <div className="text-xs text-gray-400">
                        مكتمل: {Object.values(teamQuestionMap[typeId] || {}).reduce((total, team) => {
                          return total + Object.values(team || {}).filter(Boolean).length;
                        }, 0)} / 6
                      </div>
                      {Object.values(teamQuestionMap[typeId] || {}).reduce((total, team) => {
                        return total + Object.values(team || {}).filter(Boolean).length;
                      }, 0) === 6 && (
                        <div className="text-green-400 text-sm font-bold mt-1">✅ مكتملة</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* مؤشر التقدم العام */}
            <div className="mt-8 text-center">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="text-white font-bold text-lg mb-2">إجمالي التقدم</div>
                <div className="text-gray-300">
                  الأسئلة المنجزة: {Object.values(teamQuestionMap).reduce((total, type) => {
                    return total + Object.values(type || {}).reduce((typeTotal, team) => {
                      return typeTotal + Object.values(team || {}).filter(Boolean).length;
                    }, 0);
                  }, 0)} / {selectedTypes.length * 6}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500" 
                    style={{
                      width: `${(Object.values(teamQuestionMap).reduce((total, type) => {
                        return total + Object.values(type || {}).reduce((typeTotal, team) => {
                          return typeTotal + Object.values(team || {}).filter(Boolean).length;
                        }, 0);
                      }, 0) / (selectedTypes.length * 6)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* نافذة السؤال */}
        {currentQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                
                {/* عنوان السؤال */}
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 rounded-2xl font-bold text-xl bg-slate-600 text-white">
                    {currentQuestion.points} نقطة - {questionTypes.find(t => t.id === currentQuestion.typeId).name}
                  </div>
                  <p className="text-gray-400 mt-2">سؤال للفريق {currentQuestion.team === 'red' ? 'الأحمر' : 'الأزرق'}</p>
                </div>

                {/* نص السؤال */}
                <div className="text-center mb-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                  </div>
                </div>

                {/* صورة السؤال */}
                {currentQuestion.hasImage && currentQuestion.imageUrl && (
                  <div className="flex justify-center mb-8">
                    <div className="relative group">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="صورة السؤال" 
                        className="max-w-full max-h-64 md:max-h-80 lg:max-h-96 object-contain rounded-3xl shadow-2xl border-4 border-purple-400/50 cursor-pointer hover:border-purple-400 hover:scale-105 transition-all duration-300"
                        onClick={() => zoomImage(currentQuestion.imageUrl)}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x250/6366F1/FFFFFF?text=صورة+السؤال';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
                    </div>
                  </div>
                )}

                {/* الإجابة */}
                {showAnswer && (
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-400">الإجابة الصحيحة</h4>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                      <p className="text-2xl md:text-3xl text-white font-bold">{currentQuestion.answer}</p>
                    </div>

                    {/* صورة الإجابة */}
                    {currentQuestion.hasAnswerImage && currentQuestion.answerImageUrl && (
                      <div className="flex justify-center">
                        <div className="relative group">
                          <img 
                            src={currentQuestion.answerImageUrl} 
                            alt="صورة الجواب" 
                            className="max-w-full max-h-48 md:max-h-64 object-contain rounded-2xl shadow-lg border-2 border-emerald-400/50 cursor-pointer hover:scale-105 transition-transform duration-300"
                            onClick={() => zoomImage(currentQuestion.answerImageUrl)}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=صورة+الجواب';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* أزرار التحكم - خيارات من أجاب */}
                <div className="flex flex-wrap justify-center gap-4">
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105"
                    >
                      عرض الإجابة
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => addPoints(currentQuestion.points, 'red')}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      >
                        🔴 الأحمر أجاب صح (+{currentQuestion.points})
                      </button>
                      <button
                        onClick={() => addPoints(currentQuestion.points, 'blue')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      >
                        🔵 الأزرق أجاب صح (+{currentQuestion.points})
                      </button>
                      <button
                        onClick={closeQuestion}
                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                      >
                        ❌ لا أحد أجاب صح
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تأكيد إعادة التعيين */}
        <ConfirmModal
          isOpen={showConfirmReset}
          onClose={() => setShowConfirmReset(false)}
          onConfirm={resetGame}
          title="إعادة تعيين اللعبة"
          message="هل أنت متأكد من إعادة تعيين اللعبة؟ سيتم فقدان جميع البيانات الحالية."
        />

        {/* نافذة زووم الصورة */}
        <ImageModal 
          isOpen={!!zoomedImage} 
          imageUrl={zoomedImage} 
          onClose={() => setZoomedImage(null)} 
        />

        <ToastNotification />
      </div>
    );
  }

  // مرحلة انتهاء اللعبة
  if (gamePhase === 'finished') {
    const winner = teams[0].score > teams[1].score ? teams[0] : teams[1].score > teams[0].score ? teams[1] : null;
    
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-8xl mb-8 animate-bounce">🏆</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">انتهت اللعبة!</h1>
            
            {winner ? (
              <div className="mb-8">
                <div className="text-3xl md:text-4xl text-yellow-400 font-bold mb-4">
                  🎉 الفائز: {winner.name}
                </div>
                <div className="text-2xl text-white mb-2">
                  النقاط النهائية: {winner.score}
                </div>
                <div className="text-xl text-gray-400">
                  الفريق الآخر: {teams.find(t => t.color !== winner.color).score} نقطة
                </div>
              </div>
            ) : (
              <div className="text-3xl md:text-4xl text-blue-400 font-bold mb-8">
                🤝 تعادل مثير! ({teams[0].score} - {teams[1].score})
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 mx-2"
              >
                🎮 لعبة جديدة
              </button>
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 mx-2"
              >
                🏠 العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>

        <ToastNotification />
      </div>
    );
  }
}