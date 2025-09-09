// components/DiceInstructions.jsx
import React, { useState } from 'react';

export default function DiceInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <>
      {/* زر التعليمات */}
      <button
        onClick={() => setShowInstructions(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40"
        title="تعليمات اللعبة"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {/* نافذة التعليمات */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-600 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                🎲 تعليمات لعبة النرد
              </h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 text-slate-200">
              {/* طريقة اللعب */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  🎮 طريقة اللعب
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <span>كل فريق يلعب بالتناوب لمدة 10 جولات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <span>في كل دور، يرمي الفريق نردين معاً</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">3.</span>
                    <span>النرد الأول يحدد نوع السؤال، والثاني يحدد عدد النقاط</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">4.</span>
                    <span>إذا أجاب الفريق صحيحاً، يحصل على النقاط المحددة</span>
                  </li>
                </ul>
              </div>

              {/* أنواع الأسئلة */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  📚 أنواع الأسئلة
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏛️</span>
                    <span>تاريخ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌍</span>
                    <span>جغرافيا</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚽</span>
                    <span>رياضة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧬</span>
                    <span>علوم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <span>ثقافة عامة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💻</span>
                    <span>تكنولوجيا</span>
                  </div>
                </div>
              </div>

              {/* قيم النقاط */}
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                  💎 قيم النقاط
                </h3>
                <div className="grid grid-cols-3 gap-3 text-sm text-center">
                  <div className="bg-emerald-500/20 rounded-lg p-2">
                    <div className="font-bold text-emerald-400">100</div>
                    <div className="text-xs">نقطة</div>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-2">
                    <div className="font-bold text-blue-400">150</div>
                    <div className="text-xs">نقطة</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-2">
                    <div className="font-bold text-purple-400">200</div>
                    <div className="text-xs">نقطة</div>
                  </div>
                  <div className="bg-orange-500/20 rounded-lg p-2">
                    <div className="font-bold text-orange-400">250</div>
                    <div className="text-xs">نقطة</div>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-2">
                    <div className="font-bold text-red-400">300</div>
                    <div className="text-xs">نقطة</div>
                  </div>
                  <div className="bg-yellow-500/20 rounded-lg p-2">
                    <div className="font-bold text-yellow-400">350</div>
                    <div className="text-xs">نقطة</div>
                  </div>
                </div>
              </div>

              {/* نصائح */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30">
                <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  💡 نصائح
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>الحظ يلعب دوراً كبيراً في هذه اللعبة!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>تنوع الأسئلة يجعل اللعبة ممتعة للجميع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>يمكن تعديل عدد الجولات حسب الرغبة</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                ابدأ اللعب! 🎲
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}