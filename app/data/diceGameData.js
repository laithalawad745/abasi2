  // النرد  

export const diceGameData = {
  questionTypes: [
    {
      id: 1,
      name: 'تاريخ',
      color: 'from-amber-500 to-orange-500',
      icon: '🏛️',
      questions: [
        {
          question: 'متى بدأت الحرب العالمية الأولى؟',
          answer: '1914',
          difficulty: 'easy'
        },
        {
          question: 'من هو أول خليفة راشدي؟',
          answer: 'أبو بكر الصديق',
          difficulty: 'easy'
        },


        
        {
          question: 'في أي عام سقطت الإمبراطورية البيزنطية؟',
          answer: '1453',
          difficulty: 'medium'
        },
        {
          question: 'من هو قائد المسلمين في معركة حطين؟',
          answer: 'صلاح الدين الأيوبي',
          difficulty: 'medium'
        },
        {
          question: 'ما هو اسم المعاهدة التي أنهت الحرب العالمية الأولى؟',
          answer: 'معاهدة فرساي',
          difficulty: 'hard'
        },
        {
          question: 'في أي عام تم توقيع اتفاقية كامب ديفيد؟',
          answer: '1978',
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
          question: 'ما هي عاصمة أستراليا؟',
          answer: 'كانبرا',
          difficulty: 'easy'
        },
        {
          question: 'ما هو أطول نهر في العالم؟',
          answer: 'نهر النيل',
          difficulty: 'easy'
        },
        {
          question: 'في أي قارة تقع صحراء كالاهاري؟',
          answer: 'إفريقيا',
          difficulty: 'medium'
        },
        {
          question: 'ما هو أعمق محيط في العالم؟',
          answer: 'المحيط الهادئ',
          difficulty: 'medium'
        },
        {
          question: 'ما هي أصغر دولة في العالم من حيث المساحة؟',
          answer: 'الفاتيكان',
          difficulty: 'hard'
        },
        {
          question: 'ما هو اسم المضيق الذي يفصل بين آسيا وأمريكا الشمالية؟',
          answer: 'مضيق بيرنغ',
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
          question: 'كم عدد اللاعبين في فريق كرة القدم؟',
          answer: '11 لاعب',
          difficulty: 'easy'
        },
        {
          question: 'في أي دولة أقيمت كأس العالم 2018؟',
          answer: 'روسيا',
          difficulty: 'easy'
        },
        {
          question: 'من هو اللاعب الذي سجل أكثر الأهداف في تاريخ كأس العالم؟',
          answer: 'ميروسلاف كلوزه',
          difficulty: 'medium'
        },
        {
          question: 'كم مرة فازت البرازيل بكأس العالم؟',
          answer: '5 مرات',
          difficulty: 'medium'
        },
        {
          question: 'من هو أصغر لاعب سجل في نهائي كأس العالم؟',
          answer: 'بيليه',
          difficulty: 'hard'
        },
        {
          question: 'في أي عام تأسس نادي ريال مدريد؟',
          answer: '1902',
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
          question: 'ما هو الرمز الكيميائي للماء؟',
          answer: 'H2O',
          difficulty: 'easy'
        },
        {
          question: 'كم عدد العظام في جسم الإنسان البالغ؟',
          answer: '206 عظمة',
          difficulty: 'easy'
        },
        {
          question: 'ما هو أقرب كوكب إلى الشمس؟',
          answer: 'عطارد',
          difficulty: 'medium'
        },
        {
          question: 'ما هو الغاز الذي يشكل 78% من الغلاف الجوي؟',
          answer: 'النيتروجين',
          difficulty: 'medium'
        },
        {
          question: 'من هو العالم الذي وضع نظرية التطور؟',
          answer: 'تشارلز داروين',
          difficulty: 'hard'
        },
        {
          question: 'ما هو اسم الجسيم الذي يحمل الشحنة السالبة في الذرة؟',
          answer: 'الإلكترون',
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
          question: 'من هو مؤلف رواية "مئة عام من العزلة"؟',
          answer: 'غابرييل غارسيا ماركيز',
          difficulty: 'easy'
        },
        {
          question: 'ما هي عملة اليابان؟',
          answer: 'الين',
          difficulty: 'easy'
        },
        {
          question: 'من هو مخرج فيلم "العراب"؟',
          answer: 'فرانسيس فورد كوبولا',
          difficulty: 'medium'
        },
        {
          question: 'ما هو اللقب الذي يُطلق على مدينة البندقية؟',
          answer: 'مدينة القنوات',
          difficulty: 'medium'
        },
        {
          question: 'من هو الفنان الذي رسم لوحة "الموناليزا"؟',
          answer: 'ليوناردو دا فينشي',
          difficulty: 'hard'
        },
        {
          question: 'ما هو اسم أطول مبنى في العالم؟',
          answer: 'برج خليفة',
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
          question: 'من هو مؤسس شركة أبل؟',
          answer: 'ستيف جوبز',
          difficulty: 'easy'
        },
        {
          question: 'ما هو الاسم الكامل لـ WWW؟',
          answer: 'World Wide Web',
          difficulty: 'easy'
        },
        {
          question: 'في أي عام تم إطلاق أول iPhone؟',
          answer: '2007',
          difficulty: 'medium'
        },
        {
          question: 'ما هو اسم أول شبكة اجتماعية؟',
          answer: 'Six Degrees',
          difficulty: 'medium'
        },
        {
          question: 'من هو مخترع لغة البرمجة Python؟',
          answer: 'جويدو فان روسم',
          difficulty: 'hard'
        },
        {
          question: 'ما هو المعنى الكامل لـ AI؟',
          answer: 'Artificial Intelligence',
          difficulty: 'hard'
        }
      ]
    }
  ],

  pointValues: [100, 150, 200, 250, 300, 350]
};