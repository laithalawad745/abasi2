// components/WorldQuestion.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function WorldQuestion({ 
  currentWorldQuestion,
  showWorldAnswer,
  finishWorldAnswering,
  awardWorldPoints,
  noCorrectWorldAnswer
}) {
  // نتأكد إننا على الكلاينت قبل استخدام document
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // قفل/فتح السكرول + رجوع للأعلى عند فتح السؤال
  useEffect(() => {
    if (!mounted) return;
    if (currentWorldQuestion) {
      // اقفل سكرول الصفحة
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      // رجّع viewport لفوق (مش سكرول كونتينر داخلي)
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [mounted, currentWorldQuestion]);

  if (!mounted || !currentWorldQuestion) return null;

  const modal = (
    // مودال ثابت يغطي الشاشة—دائمًا بمنتصف الـ viewport
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      // امنع تمرير الأحداث للخلفية
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl p-4 md:p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto overscroll-contain border border-slate-600 shadow-2xl">
        <div className="text-center mb-4 md:mb-6">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-white mb-2">
                {currentWorldQuestion.country.name}
              </h2>
       
            </div>
          </div>
        </div>

        <h3 className="text-lg md:text-2xl font-bold text-center mb-6 md:mb-8 text-slate-100">
          {currentWorldQuestion.question}
        </h3>

        {!showWorldAnswer ? (
          <div className="text-center">
            <button
              onClick={finishWorldAnswering}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg transition-all duration-300"
            >
              انتهينا من الإجابة
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-4 md:p-6 mb-6 md:mb-8 backdrop-blur-sm">
              <h4 className="text-base md:text-lg font-bold text-emerald-400 mb-2 md:mb-3">
                الإجابة الصحيحة:
              </h4>
              <p className="text-lg md:text-2xl text-white font-semibold mb-4">
                {currentWorldQuestion.answer}
              </p>

              {currentWorldQuestion.hiddenDifficulty && (
                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      currentWorldQuestion.hiddenDifficulty === 'easy'
                        ? 'bg-green-500 text-white'
                        : currentWorldQuestion.hiddenDifficulty === 'medium'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {currentWorldQuestion.hiddenDifficulty === 'easy'
                      ? 'سؤال سهل'
                      : currentWorldQuestion.hiddenDifficulty === 'medium'
                      ? 'سؤال متوسط'
                      : 'سؤال صعب'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6">
              <button
                onClick={() => awardWorldPoints('red')}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
              >
                الفريق الأحمر أجاب صح
              </button>
              <button
                onClick={noCorrectWorldAnswer}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
              >
                لا أحد أجاب صح
              </button>
              <button
                onClick={() => awardWorldPoints('blue')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg transition-all duration-300"
              >
                الفريق الأزرق أجاب صح
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 🚀 نركّب المودال على <body> مباشرة
  return createPortal(modal, document.body);
}
