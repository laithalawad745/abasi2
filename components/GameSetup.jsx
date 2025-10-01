// components/GameSetup.jsx - إضافة Football Grid
'use client';

import React from 'react';
import Link from 'next/link';

export default function GameSetup() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-4xl md:text-5xl font-black text-white tracking-wider">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              ABSI
            </span>
          </div>
          <Link 
            href="/contact" 
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            تواصل معنا
          </Link>
        </div>

        {/* العنوان الرئيسي */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
            منصة الألعاب
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              التفاعلية
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
            اكتشف عالماً من التحديات والمتعة مع أصدقائك
          </p>
        </div>

        {/* شبكة الألعاب */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* 🆕 Football Grid - لعبة جديدة */}
            <Link href="/football-grid" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-green-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">⚽</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Football Grid</h3>
                  <p className="text-gray-400 mb-4">لعبة Tic-Tac-Toe مع لاعبي كرة القدم. اختر مربع وأجب عن لاعب يطابق المعايير!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">لاعبين اثنين</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">أونلاين</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">تكتيكي</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* باقي الألعاب الموجودة */}
            {/* لايفات عبسي */}
            <Link href="/absi-lives" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-red-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/10 group-hover:to-orange-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎮</div>
                  <h3 className="text-2xl font-bold text-white mb-3">لايفات عبسي</h3>
                  <p className="text-gray-400 mb-4">أسئلة عن اللحظات الأسطورية من لايفات عبسي مع صور وفيديوهات!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">فريقين</span>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm">محلي</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* الاختيارات */}
            <Link href="/choices-game" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
                  <h3 className="text-2xl font-bold text-white mb-3">الاختيارات</h3>
                  <p className="text-gray-400 mb-4">لعبة "قولوا كلمة" - أجب بإجابات تطابق السؤال واكسب النقاط!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">فريقين</span>
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-sm">إبداعي</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* QR Game */}
            <Link href="/qr-game" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📱</div>
                  <h3 className="text-2xl font-bold text-white mb-3">QR Game</h3>
                  <p className="text-gray-400 mb-4">امسح الكود واكتشف السؤال المخفي!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">فريقين</span>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">تقني</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* الأسرع */}
            <Link href="/fastest" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-orange-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <h3 className="text-2xl font-bold text-white mb-3">الأسرع</h3>
                  <p className="text-gray-400 mb-4">سباق سرعة - من يجيب أولاً يفوز!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm">لاعبين</span>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">أونلاين</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* خمن من؟ */}
            <Link href="/guess-who" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-teal-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🕵️</div>
                  <h3 className="text-2xl font-bold text-white mb-3">خمن من؟</h3>
                  <p className="text-gray-400 mb-4">استبعد الشخصيات وخمن شخصية خصمك!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm">لاعبين</span>
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">منطق</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* مسيرة اللاعبين */}
            <Link href="/player-career" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-green-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">⚽</div>
                  <h3 className="text-2xl font-bold text-white mb-3">مسيرة اللاعبين</h3>
                  <p className="text-gray-400 mb-4">خمن اللاعب من خلال نوادي مسيرته!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">لاعبين</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">كرة قدم</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* التلميحات */}
            <Link href="/clues" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-indigo-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💡</div>
                  <h3 className="text-2xl font-bold text-white mb-3">التلميحات التدريجية</h3>
                  <p className="text-gray-400 mb-4">خمن الإجابة من 10 تلميحات تدريجية!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm">لاعبين</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">ذكاء</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* الهيمنة (Risk) */}
            <Link href="/risk" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-red-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/10 group-hover:to-orange-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🌍</div>
                  <h3 className="text-2xl font-bold text-white mb-3">الهيمنة</h3>
                  <p className="text-gray-400 mb-4">لعبة استراتيجية على خريطة العالم!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">متعدد اللاعبين</span>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm">استراتيجية</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* خمن الخطأ */}
            <Link href="/guess-wrong" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-yellow-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-amber-500/0 group-hover:from-yellow-500/10 group-hover:to-amber-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">❓</div>
                  <h3 className="text-2xl font-bold text-white mb-3">خمن الخطأ</h3>
                  <p className="text-gray-400 mb-4">حدد الشخص الخطأ من بين الاختيارات!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">فريقين</span>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm">معرفة</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* البطولة */}
            <Link href="/tournament" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-amber-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 group-hover:from-amber-500/10 group-hover:to-yellow-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🏆</div>
                  <h3 className="text-2xl font-bold text-white mb-3">البطولة</h3>
                  <p className="text-gray-400 mb-4">تنافس عبر جولات حتى النهائي!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm">لاعبين</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">تنافسي</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* المزاد */}
            <Link href="/auction" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-emerald-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💰</div>
                  <h3 className="text-2xl font-bold text-white mb-3">المزاد</h3>
                  <p className="text-gray-400 mb-4">زايد على الأسئلة واربح النقاط!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">فريقين</span>
                    <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm">استراتيجية</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* الرهان */}
            <Link href="/betting" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-pink-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-500/0 group-hover:from-pink-500/10 group-hover:to-rose-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎲</div>
                  <h3 className="text-2xl font-bold text-white mb-3">الرهان</h3>
                  <p className="text-gray-400 mb-4">راهن على إجاباتك واربح الضعف!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-sm">فريقين</span>
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-sm">محفوف بالمخاطر</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* صورة وتعليق */}
            <Link href="/photo-comment" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-violet-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📸</div>
                  <h3 className="text-2xl font-bold text-white mb-3">صورة وتعليق</h3>
                  <p className="text-gray-400 mb-4">ضع تعليقك وخمن من كتب كل تعليق!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-lg text-sm">متعدد اللاعبين</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">إبداعي</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* أوجد الدولة */}
            <Link href="/find-country" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-sky-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-blue-500/0 group-hover:from-sky-500/10 group-hover:to-blue-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🗺️</div>
                  <h3 className="text-2xl font-bold text-white mb-3">أوجد الدولة</h3>
                  <p className="text-gray-400 mb-4">حدد موقع الدول على خريطة العالم!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-lg text-sm">فردي</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">جغرافيا</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* سؤال وجواب */}
            <Link href="/question-answer" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-lime-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-500/0 to-green-500/0 group-hover:from-lime-500/10 group-hover:to-green-500/10 rounded-3xl transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">❔</div>
                  <h3 className="text-2xl font-bold text-white mb-3">سؤال وجواب</h3>
                  <p className="text-gray-400 mb-4">أسئلة متنوعة في فئات مختلفة!</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-lime-500/20 text-lime-400 rounded-lg text-sm">فريقين</span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">معرفة عامة</span>
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* قسم المميزات */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              مميزات المنصة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">تنوع الألعاب</h3>
                <p className="text-gray-400">مجموعة واسعة من الألعاب التفاعلية</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">سهولة الاستخدام</h3>
                <p className="text-gray-400">تصميم بسيط وسهل للجميع</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">لعب جماعي</h3>
                <p className="text-gray-400">استمتع مع الأصدقاء والعائلة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}