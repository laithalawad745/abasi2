// app/data/questionAnswerData.js
// 🎯 بيانات لعبة سؤال و جواب

// 8 أنواع الأسئلة المتاحة
export const questionTypes = [
  { id: 'cars', name: 'سيارات', icon: '🚗', color: 'from-red-500 to-red-600' },
  { id: 'history', name: 'تاريخ', icon: '🏛️', color: 'from-amber-500 to-orange-600' },
  { id: 'geography', name: 'جغرافيا', icon: '🌍', color: 'from-green-500 to-green-600' },
  { id: 'series', name: 'مسلسلات', icon: '📺', color: 'from-purple-500 to-purple-600' },
  { id: 'sports', name: 'رياضة', icon: '⚽', color: 'from-blue-500 to-blue-600' },
  { id: 'science', name: 'علوم', icon: '🔬', color: 'from-cyan-500 to-cyan-600' },
  { id: 'food', name: 'طعام', icon: '🍕', color: 'from-yellow-500 to-yellow-600' },
  { id: 'technology', name: 'تكنولوجيا', icon: '💻', color: 'from-indigo-500 to-indigo-600' }
];

// بيانات الأسئلة لكل نوع
export const questionAnswerData = {
  // 🚗 أسئلة السيارات
  cars: {
    name: 'سيارات',
    icon: '🚗',
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
      {
        id: 'cars_easy_4',
        question: 'ما هي شركة صناعة سيارة الفيراري؟',
        answer: 'فيراري (إيطاليا)',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_easy_5',
        question: 'أين يقع عداد السرعة في السيارة؟',
        answer: 'في لوحة القيادة أمام السائق',
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
      {
        id: 'cars_medium_4',
        question: 'ما هو الحد الأقصى للسرعة على الطرق السريعة في السعودية؟',
        answer: '120 كم/ساعة',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_medium_5',
        question: 'ما هي وظيفة الفرامل ABS في السيارة؟',
        answer: 'منع انغلاق العجلات عند الفرملة',
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
      },
      {
        id: 'cars_hard_4',
        question: 'ما هي تقنية الدفع الرباعي المستخدمة في سيارات أودي؟',
        answer: 'Quattro',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'cars_hard_5',
        question: 'كم عدد أسطوانات محرك V12؟',
        answer: '12 أسطوانة',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },

  // 🏛️ أسئلة التاريخ
  history: {
    name: 'تاريخ',
    icon: '🏛️',
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
        question: 'كم استمر الحكم العثماني؟',
        answer: 'حوالي 600 سنة',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_easy_4',
        question: 'في أي قرن عاش ابن خلدون؟',
        answer: 'القرن الرابع عشر الميلادي',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_easy_5',
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
      {
        id: 'history_medium_4',
        question: 'من هو قائد الفتوحات الإسلامية في بلاد الشام؟',
        answer: 'خالد بن الوليد',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_medium_5',
        question: 'ما اسم الحرب بين العثمانيين والصفويين؟',
        answer: 'الحروب العثمانية الصفوية',
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
        question: 'ما اسم المعاهدة التي قسمت الإمبراطورية العثمانية بعد الحرب العالمية الأولى؟',
        answer: 'معاهدة سيفر',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_hard_4',
        question: 'من هو آخر خلفاء بني العباس في بغداد؟',
        answer: 'المستعصم بالله',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'history_hard_5',
        question: 'في أي معركة انتصر العثمانيون على البيزنطيين وفتحوا القسطنطينية؟',
        answer: 'حصار القسطنطينية 1453',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },

  // 🌍 أسئلة الجغرافيا
  geography: {
    name: 'جغرافيا',
    icon: '🌍',
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
      {
        id: 'geography_easy_4',
        question: 'ما هي أكبر قارة في العالم؟',
        answer: 'آسيا',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_easy_5',
        question: 'في أي قارة تقع دولة البرازيل؟',
        answer: 'أمريكا الجنوبية',
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
      {
        id: 'geography_medium_4',
        question: 'ما هو أعمق محيط في العالم؟',
        answer: 'المحيط الهادئ',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_medium_5',
        question: 'كم عدد الدول العربية؟',
        answer: '22 دولة',
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
      },
      {
        id: 'geography_hard_4',
        question: 'ما اسم الصحراء الموجودة في منغوليا والصين؟',
        answer: 'صحراء جوبي',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'geography_hard_5',
        question: 'كم يبلغ عمق خندق ماريانا تقريباً؟',
        answer: '11,000 متر تحت سطح البحر',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },

  // 📺 أسئلة المسلسلات
  series: {
    name: 'مسلسلات',
    icon: '📺',
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
        question: 'ما اسم المسلسل الذي يتحدث عن طارق بن زياد؟',
        answer: 'فتوحات الأندلس أو طارق بن زياد',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_easy_4',
        question: 'من هو بطل مسلسل "عمر بن الخطاب"؟',
        answer: 'سامر إسماعيل',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_easy_5',
        question: 'ما اسم مسلسل "Friends" باللغة العربية؟',
        answer: 'الأصدقاء',
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
        question: 'ما اسم مسلسل محمد صبحي الشهير في التسعينات؟',
        answer: 'البرامج الإذاعية (أو العديد منها)',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_medium_4',
        question: 'من بطل مسلسل "العراب نور الشريف"؟',
        answer: 'نور الشريف',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_medium_5',
        question: 'في أي عقد بدأ مسلسل "المتزوجون"؟',
        answer: 'الثمانينات',
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
      },
      {
        id: 'series_hard_4',
        question: 'ما اسم الشخصية التي لعبها عباس النوري في "باب الحارة"؟',
        answer: 'أبو عصام',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'series_hard_5',
        question: 'في أي عام عُرض مسلسل "دنيا" لرغدة؟',
        answer: '2005',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },

  // ⚽ أسئلة الرياضة
  sports: {
    name: 'رياضة',
    icon: '⚽',
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
      {
        id: 'sports_easy_4',
        question: 'ما هو لقب نادي ريال مدريد؟',
        answer: 'الملكي أو الميرينجي',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_easy_5',
        question: 'كم دقيقة مباراة كرة القدم الرسمية؟',
        answer: '90 دقيقة',
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
      {
        id: 'sports_medium_4',
        question: 'من هو أول لاعب عربي فاز بالكرة الذهبية؟',
        answer: 'لم يفز أي لاعب عربي بالكرة الذهبية',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_medium_5',
        question: 'ما اسم ملعب نادي الهلال السعودي؟',
        answer: 'استاد الملك فهد الدولي',
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
      },
      {
        id: 'sports_hard_4',
        question: 'ما هو أقدم نادي في المملكة العربية السعودية؟',
        answer: 'الاتحاد (تأسس 1927)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'sports_hard_5',
        question: 'من فاز بأول بطولة دوري أبطال آسيا للأندية؟',
        answer: 'الهلال العراقي (1967)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },

  // 🔬 أسئلة العلوم
  science: {
    name: 'علوم',
    icon: '🔬',
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
      {
        id: 'science_easy_4',
        question: 'ما هو الغاز الأكثر انتشاراً في الغلاف الجوي؟',
        answer: 'النيتروجين',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_easy_5',
        question: 'كم عدد أطراف الأخطبوط؟',
        answer: '8 أذرع',
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
        question: 'كم سنة ضوئية تبعد أقرب النجوم عن الشمس؟',
        answer: '4.24 سنة ضوئية (بروكسيما سنتوري)',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_medium_4',
        question: 'ما اسم العملية التي تحول النباتات الضوء إلى طاقة؟',
        answer: 'البناء الضوئي',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_medium_5',
        question: 'كم عدد الكروموسومات في الخلية البشرية؟',
        answer: '46 كروموسوم',
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
        question: 'ما اسم النظرية التي تصف سلوك الجسيمات دون الذرية؟',
        answer: 'ميكانيكا الكم',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_hard_4',
        question: 'كم تبلغ سرعة الضوء في الفراغ؟',
        answer: '299,792,458 متر في الثانية',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'science_hard_5',
        question: 'ما هو اسم أصغر وحدة من المادة التي تحتفظ بخصائصها؟',
        answer: 'الذرة',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },

  // 🍕 أسئلة الطعام
  food: {
    name: 'طعام',
    icon: '🍕',
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
      {
        id: 'food_easy_4',
        question: 'ما هي الفاكهة التي تحتوي على فيتامين C أكثر؟',
        answer: 'البرتقال (أو الحمضيات)',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_easy_5',
        question: 'ما هو المشروب المصنوع من أوراق الشاي؟',
        answer: 'الشاي',
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
      {
        id: 'food_medium_4',
        question: 'ما اسم الطبق الياباني المصنوع من الأرز والسمك النيء؟',
        answer: 'السوشي',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_medium_5',
        question: 'من أي حيوان يُستخرج الكافيار؟',
        answer: 'السمك (سمك الحفش)',
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
        question: 'أي نوع من الجبن يُطلق عليه "ملك الجبن"؟',
        answer: 'جبن روكفور',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_hard_4',
        question: 'كم عدد السعرات الحرارية في جرام واحد من الدهون؟',
        answer: '9 سعرات حرارية',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'food_hard_5',
        question: 'ما هو اسم التقنية الفرنسية لطبخ الطعام في درجة حرارة منخفضة؟',
        answer: 'السو فيد (Sous-vide)',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  },

  // 💻 أسئلة التكنولوجيا
  technology: {
    name: 'تكنولوجيا',
    icon: '💻',
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
      {
        id: 'tech_easy_4',
        question: 'في أي عام تم إطلاق أول iPhone؟',
        answer: '2007',
        difficulty: 'easy',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_easy_5',
        question: 'ما اسم نظام التشغيل المجاني مفتوح المصدر؟',
        answer: 'لينكس',
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
        question: 'ما هو اسم عملة البيتكوين الرقمية؟',
        answer: 'BTC أو Bitcoin',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_medium_4',
        question: 'أي شركة طورت نظام تشغيل أندرويد؟',
        answer: 'جوجل',
        difficulty: 'medium',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_medium_5',
        question: 'ما معنى اختصار AI في التكنولوجيا؟',
        answer: 'Artificial Intelligence (الذكاء الاصطناعي)',
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
        question: 'ما هو اسم أول شبكة اجتماعية في التاريخ؟',
        answer: 'Six Degrees',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_hard_4',
        question: 'كم عدد البتات في البايت الواحد؟',
        answer: '8 بتات',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      },
      {
        id: 'tech_hard_5',
        question: 'ما هو اسم خوارزمية جوجل الأصلية لترتيب نتائج البحث؟',
        answer: 'PageRank',
        difficulty: 'hard',
        hasImage: false,
        hasAnswerImage: false
      }
    ]
  }
};

// دوال مساعدة
export const getQuestionsByType = (typeId) => {
  return questionAnswerData[typeId]?.questions || [];
};

export const getQuestionsByDifficulty = (typeId, difficulty) => {
  const questions = getQuestionsByType(typeId);
  return questions.filter(q => q.difficulty === difficulty);
};

export const getRandomQuestion = (typeId, difficulty, usedQuestionIds = []) => {
  const questions = getQuestionsByDifficulty(typeId, difficulty);
  const availableQuestions = questions.filter(q => !usedQuestionIds.includes(q.id));
  
  if (availableQuestions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};

export const getTotalQuestionsCount = () => {
  let total = 0;
  Object.keys(questionAnswerData).forEach(typeId => {
    total += questionAnswerData[typeId].questions.length;
  });
  return total;
};

export const getStatistics = () => {
  const stats = {};
  Object.keys(questionAnswerData).forEach(typeId => {
    const questions = questionAnswerData[typeId].questions;
    stats[typeId] = {
      total: questions.length,
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length
    };
  });
  return stats;
};