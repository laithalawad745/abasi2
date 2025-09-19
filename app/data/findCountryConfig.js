// app/data/findCountryConfig.js - إعدادات وتكوين لعبة أوجد الدولة

// إعدادات اللعبة الأساسية
export const GAME_CONFIG = {
  // إعدادات الأسئلة
  QUESTIONS_PER_PLAYER: 10,
  POINTS_PER_CORRECT_ANSWER: 100,
  POINTS_PER_WRONG_ANSWER: 0,
  
  // إعدادات الوقت
  QUESTION_TIMEOUT: 60, // ثانية
  RESULT_DISPLAY_TIME: 3000, // مللي ثانية
  
  // إعدادات اللاعبين
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 8,
  
  // إعدادات الخريطة
  MAP_SCALE: 160,
  MAP_WIDTH: 1000,
  MAP_HEIGHT: 600,
  ZOOM_SCALE_EXTENT: [0.5, 8],
  
  // ألوان الإجابات
  CORRECT_ANSWER_COLOR: '#22c55e', // أخضر
  WRONG_ANSWER_COLOR: '#ef4444',   // أحمر
  DEFAULT_COUNTRY_COLOR: '#cccccc', // رمادي فاتح
  UNAVAILABLE_COUNTRY_COLOR: '#1e293b', // رمادي داكن
  
  // مدة عرض الإشعارات
  TOAST_DURATION: 3000
};

// ألوان اللاعبين
export const PLAYER_COLORS = [
  '#ff4444', // أحمر
  '#4444ff', // أزرق  
  '#44ff44', // أخضر
  '#ffff44', // أصفر
  '#ff44ff', // بنفسجي
  '#44ffff', // سماوي
  '#ff8844', // برتقالي
  '#8844ff'  // بنفسجي غامق
];

// معلومات القارات
export const CONTINENTS = {
  'أوروبا': {
    color: '#3b82f6',
    icon: '🇪🇺',
    description: 'القارة العجوز'
  },
  'آسيا': {
    color: '#ef4444',
    icon: '🏮',
    description: 'أكبر قارات العالم'
  },
  'أفريقيا': {
    color: '#f59e0b',
    icon: '🌍',
    description: 'القارة السمراء'
  },
  'أمريكا الشمالية': {
    color: '#10b981',
    icon: '🗽',
    description: 'العالم الجديد'
  },
  'أمريكا الجنوبية': {
    color: '#8b5cf6',
    icon: '🏔️',
    description: 'قارة الأمازون'
  },
  'أوقيانوسيا': {
    color: '#06b6d4',
    icon: '🏝️',
    description: 'جزر المحيط الهادئ'
  }
};

// أسماء الدول بالعربية
export const COUNTRY_NAMES_AR = {
  // أوروبا
  'france': 'فرنسا',
  'italy': 'إيطاليا',
  'united_kingdom': 'المملكة المتحدة',
  'germany': 'ألمانيا',
  'spain': 'إسبانيا',
  'netherlands': 'هولندا',
  'norway': 'النرويج',
  'sweden': 'السويد',
  'finland': 'فنلندا',
  'denmark': 'الدنمارك',
  'belgium': 'بلجيكا',
  'switzerland': 'سويسرا',
  'austria': 'النمسا',
  'portugal': 'البرتغال',
  'poland': 'بولندا',
  'ukraine': 'أوكرانيا',
  'romania': 'رومانيا',
  'bulgaria': 'بلغاريا',
  'greece': 'اليونان',
  'czech_republic': 'جمهورية التشيك',
  'slovakia': 'سلوفاكيا',
  'slovenia': 'سلوفينيا',
  'hungary': 'المجر',
  'croatia': 'كرواتيا',
  'bosnia_herzegovina': 'البوسنة والهرسك',
  'serbia': 'صربيا',
  'montenegro': 'الجبل الأسود',
  'albania': 'ألبانيا',
  'ireland': 'إيرلندا',
  'iceland': 'آيسلندا',
  'estonia': 'إستونيا',
  'latvia': 'لاتفيا',
  'lithuania': 'ليتوانيا',
  'belarus': 'بيلاروسيا',

  // آسيا
  'china': 'الصين',
  'japan': 'اليابان',
  'india': 'الهند',
  'russia': 'روسيا',
  'south_korea': 'كوريا الجنوبية',
  'north_korea': 'كوريا الشمالية',
  'thailand': 'تايلاند',
  'vietnam': 'فيتنام',
  'indonesia': 'إندونيسيا',
  'malaysia': 'ماليزيا',
  'philippines': 'الفلبين',
  'singapore': 'سنغافورة',
  'mongolia': 'منغوليا',
  'kazakhstan': 'كازاخستان',
  'uzbekistan': 'أوزبكستان',
  'tajikistan': 'طاجيكستان',
  'turkmenistan': 'تركمانستان',
  'kyrgyzstan': 'قيرغيزستان',
  'afghanistan': 'أفغانستان',
  'pakistan': 'باكستان',
  'bangladesh': 'بنغلاديش',
  'sri_lanka': 'سري لانكا',
  'nepal': 'نيبال',
  'bhutan': 'بوتان',
  'laos': 'لاوس',
  'cambodia': 'كمبوديا',
  'myanmar': 'ميانمار',
  'turkey': 'تركيا',
  'iran': 'إيران',
  'saudi_arabia': 'السعودية',
  'uae': 'الإمارات',
  'kuwait': 'الكويت',
  'qatar': 'قطر',
  'oman': 'عمان',
  'yemen': 'اليمن',
  'iraq': 'العراق',
  'syria': 'سوريا',
  'jordan': 'الأردن',
  'lebanon': 'لبنان',
  'israel': 'إسرائيل',
  'armenia': 'أرمينيا',
  'georgia': 'جورجيا',
  'azerbaijan': 'أذربيجان',

  // أفريقيا
  'egypt': 'مصر',
  'libya': 'ليبيا',
  'algeria': 'الجزائر',
  'morocco': 'المغرب',
  'tunisia': 'تونس',
  'sudan': 'السودان',
  'south_sudan': 'جنوب السودان',
  'ethiopia': 'إثيوبيا',
  'eritrea': 'إريتريا',
  'kenya': 'كينيا',
  'uganda': 'أوغندا',
  'tanzania': 'تنزانيا',
  'somalia': 'الصومال',
  'nigeria': 'نيجيريا',
  'ghana': 'غانا',
  'ivory_coast': 'ساحل العاج',
  'cameroon': 'الكاميرون',
  'chad': 'تشاد',
  'central_african_republic': 'أفريقيا الوسطى',
  'democratic_republic_congo': 'الكونغو الديمقراطية',
  'congo': 'الكونغو',
  'gabon': 'الغابون',
  'angola': 'أنغولا',
  'zambia': 'زامبيا',
  'zimbabwe': 'زيمبابوي',
  'botswana': 'بوتسوانا',
  'namibia': 'ناميبيا',
  'south_africa': 'جنوب أفريقيا',
  'madagascar': 'مدغشقر',
  'mauritania': 'موريتانيا',
  'mali': 'مالي',
  'niger': 'النيجر',
  'burkina_faso': 'بوركينا فاسو',
  'benin': 'بنين',
  'togo': 'توغو',
  'liberia': 'ليبيريا',
  'guinea': 'غينيا',
  'guinea_bissau': 'غينيا بيساو',
  'sierra_leone': 'سيراليون',
  'senegal': 'السنغال',
  'malawi': 'مالاوي',
  'mozambique': 'موزمبيق',
  'south_sudan': 'جنوب السودان',
'central_african_republic': 'جمهورية أفريقيا الوسطى', 
'democratic_republic_congo': 'جمهورية الكونغو الديمقراطية',
'congo': 'جمهورية الكونغو',

  // أمريكا
  'usa': 'الولايات المتحدة',
  'canada': 'كندا',
  'mexico': 'المكسيك',
  'guatemala': 'غواتيمالا',
  'cuba': 'كوبا',
  'panama': 'بنما',
  'costa_rica': 'كوستاريكا',
  'nicaragua': 'نيكاراغوا',
  'honduras': 'هندوراس',
  'brazil': 'البرازيل',
  'argentina': 'الأرجنتين',
  'chile': 'تشيلي',
  'peru': 'بيرو',
  'colombia': 'كولومبيا',
  'venezuela': 'فنزويلا',
  'bolivia': 'بوليفيا',
  'ecuador': 'الإكوادور',
  'uruguay': 'أوروغواي',
  'paraguay': 'باراغواي',
  'suriname': 'سورينام',
  'guyana': 'غيانا',
  'greenland': 'غرينلاند',

  // أوقيانوسيا
  'australia': 'أستراليا',
  'new_zealand': 'نيوزيلندا',
  'papua_new_guinea': 'بابوا غينيا الجديدة',
  'fiji': 'فيجي'
};

// دالة للحصول على اسم الدولة بالعربية
export const getCountryNameAR = (countryId) => {
  return COUNTRY_NAMES_AR[countryId] || countryId;
};

// دالة للحصول على لون القارة
export const getContinentColor = (continent) => {
  return CONTINENTS[continent]?.color || '#6b7280';
};

// دالة للحصول على أيقونة القارة
export const getContinentIcon = (continent) => {
  return CONTINENTS[continent]?.icon || '🌍';
};

// إعدادات التخزين المحلي
export const STORAGE_KEYS = {
  GAME_STATS: 'find-country-stats',
  HIGH_SCORES: 'find-country-high-scores',
  PLAYER_PREFERENCES: 'find-country-preferences',
  USED_QUESTIONS: 'find-country-used-questions'
};

// إحصائيات افتراضية
export const DEFAULT_STATS = {
  totalGamesPlayed: 0,
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  bestScore: 0,
  averageScore: 0,
  favoriteContinent: null,
  perfectGames: 0
};

// دالة لحساب نسبة النجاح
export const calculateSuccessRate = (correct, total) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

// دالة لتحديد مستوى اللاعب
export const getPlayerLevel = (totalScore) => {
  if (totalScore >= 5000) return { level: 'خبير جغرافي', icon: '🌟', color: '#f59e0b' };
  if (totalScore >= 3000) return { level: 'مستكشف العالم', icon: '🗺️', color: '#3b82f6' };
  if (totalScore >= 1500) return { level: 'رحالة', icon: '✈️', color: '#10b981' };
  if (totalScore >= 500) return { level: 'مبتدئ', icon: '🧭', color: '#8b5cf6' };
  return { level: 'جديد', icon: '🌱', color: '#6b7280' };
};

// دالة لحفظ الإحصائيات
export const saveGameStats = (gameResult) => {
  try {
    const savedStats = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    const currentStats = savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
    
    // تحديث الإحصائيات
    currentStats.totalGamesPlayed += 1;
    currentStats.totalQuestionsAnswered += gameResult.questionsAnswered;
    currentStats.correctAnswers += gameResult.correctAnswers;
    currentStats.wrongAnswers += gameResult.wrongAnswers;
    
    if (gameResult.score > currentStats.bestScore) {
      currentStats.bestScore = gameResult.score;
    }
    
    // حساب المتوسط
    currentStats.averageScore = Math.round(
      (currentStats.correctAnswers * GAME_CONFIG.POINTS_PER_CORRECT_ANSWER) / 
      currentStats.totalGamesPlayed
    );
    
    // تحديد القارة المفضلة (مؤقتاً)
    if (gameResult.continent) {
      currentStats.favoriteContinent = gameResult.continent;
    }
    
    // العد التام
    if (gameResult.score === GAME_CONFIG.QUESTIONS_PER_PLAYER * GAME_CONFIG.POINTS_PER_CORRECT_ANSWER) {
      currentStats.perfectGames += 1;
    }
    
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(currentStats));
    return currentStats;
  } catch (error) {
    console.warn('فشل في حفظ الإحصائيات:', error);
    return DEFAULT_STATS;
  }
};

// دالة لتحميل الإحصائيات
export const loadGameStats = () => {
  try {
    const savedStats = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    return savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
  } catch (error) {
    console.warn('فشل في تحميل الإحصائيات:', error);
    return DEFAULT_STATS;
  }
};