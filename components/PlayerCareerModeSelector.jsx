// components/PlayerCareerModeSelector.jsx - صفحة اختيار نوع اللعبة
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PlayerCareerGameRouter from './PlayerCareerGameRouter'; // اللعبة الأونلاين

// سنستخدم dynamic import للعبة المحلية
const PlayerCareerLocalGame = React.lazy(() => import('./PlayerCareerLocalGame'));

export default function PlayerCareerModeSelector() {
  const [selectedMode, setSelectedMode] = useState(null); // null, 'online', 'local'

  // إذا تم اختيار نوع اللعبة، اعرض اللعبة المناسبة
  if (selectedMode === 'online') {
    return <PlayerCareerGameRouter />;
  }
  
  if (selectedMode === 'local') {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-white text-xl">جاري التحميل...</div>
        </div>
      }>
        <PlayerCareerLocalGame />
      </React.Suspense>
    );
  }

  // صفحة اختيار نوع اللعبة
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              مسيرة لاعب
            </span>
          </div>
          <Link 
            href="/"
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
          >
            ← العودة للرئيسية
          </Link>
        </div>

        {/* اختيار نوع اللعبة */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              اختر نوع اللعبة
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              العب أونلاين مع أصدقائك عن بُعد أو العب محلياً على نفس الجهاز
            </p>
          </div>

          {/* خيارات اللعبة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* اللعب الأونلاين */}
            <div className="group cursor-pointer" onClick={() => setSelectedMode('online')}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-105">
                <div className="text-center">
                  {/* أيقونة */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400/50 group-hover:border-cyan-400 transition-all duration-300">
                    <div className="text-4xl">🌐</div>
                  </div>
                  
                  {/* العنوان */}
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    لعب أونلاين
                  </h2>
                  
                  {/* الوصف */}
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    العب مع أصدقائك عن بُعد. أنشئ غرفة أو انضم لغرفة موجودة باستخدام الكود.
                  </p>
                  
                  {/* المميزات */}
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>لعب عن بُعد مع الأصدقاء</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>مشاركة الغرفة بالكود</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>تزامن مباشر بين اللاعبين</span>
                    </div>
                  </div>

                  {/* زر */}
                  <div className="mt-8">
                    <div className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300">
                      ابدأ لعبة أونلاين
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* اللعب المحلي */}
            <div className="group cursor-pointer" onClick={() => setSelectedMode('local')}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105">
                <div className="text-center">
                  {/* أيقونة */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full flex items-center justify-center border-2 border-purple-400/50 group-hover:border-purple-400 transition-all duration-300">
                    <div className="text-4xl">📱</div>
                  </div>
                  
                  {/* العنوان */}
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">
                    لعب محلي
                  </h2>
                  
                  {/* الوصف */}
                  <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    العب مع صديق على نفس الجهاز. تناوبوا في الإجابة على الأسئلة.
                  </p>
                  
                  {/* المميزات */}
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>لعب على جهاز واحد</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>لا حاجة للإنترنت</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>مثالي للعب في نفس المكان</span>
                    </div>
                  </div>

                  {/* زر */}
                  <div className="mt-8">
                    <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-white group-hover:from-purple-600 group-hover:to-violet-600 transition-all duration-300">
                      ابدأ لعبة محلية
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-16 text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">قواعد اللعبة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
                <div className="space-y-2">
                  <div className="text-cyan-400 font-bold">⚽ مسيرة اللاعب</div>
                  <p className="text-sm">شاهد مسيرة لاعب كرة القدم وخمن من هو</p>
                </div>
                <div className="space-y-2">
                  <div className="text-purple-400 font-bold">🎯 3 محاولات</div>
                  <p className="text-sm">لديك 3 محاولات للإجابة على كل سؤال</p>
                </div>
                <div className="space-y-2">
                  <div className="text-green-400 font-bold">🏆 10 أسئلة لكل فريق</div>
                  <p className="text-sm">20 سؤال إجمالي - الفائز الأعلى نقاطاً</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}