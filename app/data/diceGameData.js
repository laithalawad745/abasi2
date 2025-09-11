// app/data/diceGameData.js

export const diceGameData = {
  questionTypes: [
    {
      id: 1,
      name: 'تاريخ',
      color: 'from-amber-500 to-orange-500',
      icon: '🏛️',
      questions: [
        {
          id: 'hist1',
          question: 'في أي عام فتح المسلمون الأندلس؟',
          answer: '711 م',
          difficulty: 'easy'
        },
        {
          id: 'hist2',
          question: 'من هو الحاكم الذي بنى مدينة الزهراء في قرطبة؟',
          answer: 'عبد الرحمن الناصر',
          difficulty: 'easy'
        },
        {
          id: 'hist3',
          question: 'كم سنة دامت الحرب العالمية الثانية؟',
          answer: '6 سنوات (1939-1945)',
          difficulty: 'medium'
        },
        {
          id: 'hist4',
          question: 'في أي قرن عاش ابن خلدون؟',
          answer: 'القرن الرابع عشر الميلادي',
          difficulty: 'medium'
        },
        {
          id: 'hist5',
          question: 'ما اسم المعركة التي انتصر فيها خالد بن الوليد على الفرس؟',
          answer: 'معركة ذات السلاسل',
          difficulty: 'hard'
        },
        {
          id: 'hist6',
          question: 'في أي عام سقطت الدولة العثمانية رسمياً؟',
          answer: '1922',
          difficulty: 'hard'
        }
      ]
    },
    {
      id: 2,
      name: 'جغرافيا',
      color: 'from-green-500 to-emerald-500',
      icon: '🌍',
      questions: [
        {
          id: 'geo1',
          question: 'ما هي أكبر دولة عربية من حيث المساحة؟',
          answer: 'الجزائر',
          difficulty: 'easy'
        },
        {
          id: 'geo2',
          question: 'في أي قارة تقع دولة المغرب؟',
          answer: 'أفريقيا',
          difficulty: 'easy'
        },
        {
          id: 'geo3',
          question: 'ما هو أطول نهر في آسيا؟',
          answer: 'نهر اليانغتسي',
          difficulty: 'medium'
        },
        {
          id: 'geo4',
          question: 'كم عدد الدول التي تحد تركيا؟',
          answer: '8 دول',
          difficulty: 'medium'
        },
        {
          id: 'geo5',
          question: 'ما هي عاصمة كازاخستان؟',
          answer: 'نور سلطان (أستانا سابقاً)',
          difficulty: 'hard'
        },
        {
          id: 'geo6',
          question: 'في أي محيط تقع جزر المالديف؟',
          answer: 'المحيط الهندي',
          difficulty: 'hard'
        }
      ]
    },
    {
      id: 3,
      name: 'رياضة',
      color: 'from-blue-500 to-indigo-500',
      icon: '⚽',
      questions: [
        {
          id: 'sport1',
          question: 'كم مرة حصل محمد صلاح على جائزة أفضل لاعب أفريقي؟',
          answer: 'مرتان (2017، 2018)',
          difficulty: 'easy'
        },
        {
          id: 'sport2',
          question: 'في أي نادي يلعب كريم بنزيمة حالياً؟',
          answer: 'الاتحاد السعودي',
          difficulty: 'easy'
        },
        {
          id: 'sport3',
          question: 'كم عدد الأشواط في مباراة التنس؟',
          answer: 'أفضل من 3 أو 5 أشواط',
          difficulty: 'medium'
        },
        {
          id: 'sport4',
          question: 'في أي عام استضافت قطر كأس العالم؟',
          answer: '2022',
          difficulty: 'medium'
        },
        {
          id: 'sport5',
          question: 'من هو أول لاعب عربي يسجل في نهائي دوري الأبطال؟',
          answer: 'محمد صلاح',
          difficulty: 'hard'
        },
        {
          id: 'sport6',
          question: 'كم مرة فاز الأهلي المصري بدوري أبطال أفريقيا؟',
          answer: '10 مرات',
          difficulty: 'hard'
        }
      ]
    },
    {
      id: 4,
      name: 'علوم',
      color: 'from-purple-500 to-violet-500',
      icon: '🧬',
      questions: [
        {
          id: 'sci1',
          question: 'كم عدد أسنان الإنسان البالغ؟',
          answer: '32 سن',
          difficulty: 'easy'
        },
        {
          id: 'sci2',
          question: 'ما هو الغاز الذي نتنفسه؟',
          answer: 'الأكسجين',
          difficulty: 'easy'
        },
        {
          id: 'sci3',
          question: 'كم عدد قلوب الأخطبوط؟',
          answer: '3 قلوب',
          difficulty: 'medium'
        },
        {
          id: 'sci4',
          question: 'ما هي أسرع الحيوانات على الأرض؟',
          answer: 'الفهد',
          difficulty: 'medium'
        },
        {
          id: 'sci5',
          question: 'ما هو العنصر الأكثر وفرة في الكون؟',
          answer: 'الهيدروجين',
          difficulty: 'hard'
        },
        {
          id: 'sci6',
          question: 'كم تبلغ درجة حرارة الشمس في المركز؟',
          answer: 'حوالي 15 مليون درجة مئوية',
          difficulty: 'hard'
        }
      ]
    },
    {
      id: 5,
      name: 'ثقافة عامة',
      color: 'from-pink-500 to-rose-500',
      icon: '📚',
      questions: [
        {
          id: 'culture1',
          question: 'ما هو اللقب الذي يُطلق على مدينة بيروت؟',
          answer: 'باريس الشرق',
          difficulty: 'easy'
        },
        {
          id: 'culture2',
          question: 'من هو مؤلف رواية "مدن الملح"؟',
          answer: 'عبد الرحمن منيف',
          difficulty: 'easy'
        },
        {
          id: 'culture3',
          question: 'كم عدد أصابع الجمل في القدم الواحدة؟',
          answer: 'إصبعان',
          difficulty: 'medium'
        },
        {
          id: 'culture4',
          question: 'ما هي أقدم جامعة في العالم العربي؟',
          answer: 'جامعة الأزهر',
          difficulty: 'medium'
        },
        {
          id: 'culture5',
          question: 'من هو الفنان الذي غنى "زي الهوا"؟',
          answer: 'عبد الحليم حافظ',
          difficulty: 'hard'
        },
        {
          id: 'culture6',
          question: 'في أي مدينة ولد الشاعر أحمد شوقي؟',
          answer: 'القاهرة',
          difficulty: 'hard'
        }
      ]
    },
    {
      id: 6,
      name: 'تكنولوجيا',
      color: 'from-cyan-500 to-blue-500',
      icon: '💻',
      questions: [
        {
          id: 'tech1',
          question: 'ما هو الاسم الحقيقي لمؤسس فيسبوك؟',
          answer: 'مارك زوكربيرغ',
          difficulty: 'easy'
        },
        {
          id: 'tech2',
          question: 'كم عدد الحروف المسموحة في تغريدة تويتر قديماً؟',
          answer: '140 حرف',
          difficulty: 'easy'
        },
        {
          id: 'tech3',
          question: 'ما معنى اختصار "WiFi"؟',
          answer: 'Wireless Fidelity',
          difficulty: 'medium'
        },
        {
          id: 'tech4',
          question: 'في أي عام تم إطلاق يوتيوب؟',
          answer: '2005',
          difficulty: 'medium'
        },
        {
          id: 'tech5',
          question: 'ما هو اسم أول متصفح ويب؟',
          answer: 'WorldWideWeb',
          difficulty: 'hard'
        },
        {
          id: 'tech6',
          question: 'من هو مخترع البريد الإلكتروني؟',
          answer: 'راي توملينسون',
          difficulty: 'hard'
        }
      ]
    }
  ],

  pointValues: [100, 150, 200, 250, 300, 350]
};