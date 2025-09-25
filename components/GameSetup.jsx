// components/GameSetup.jsx - تحديث لإضافة لعبة أوجد الدولة
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
            
            {/* المباراة الكاملة */}
            {/* <Link href="/full-match" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-cyan-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">المباراة الكاملة</h3>
                  <p className="text-gray-400 mb-4">اللعبة الشاملة مع جميع المواضيع والفقرات التفاعلية</p>
                  <div className="flex items-center text-cyan-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link> */}

            {/* 🆕 لعبة أوجد الدولة */}
            <Link href="/find-country" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-green-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">أوجد الدولة</h3>
                  <p className="text-gray-400 mb-4">اختبر معرفتك بالجغرافيا العالمية   </p>
                  <div className="flex items-center text-green-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* فقرة الاختيارات */}
            {/* <Link href="/choices-game" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">فقرة الاختيارات</h3>
                  <p className="text-gray-400 mb-4">لعبة "قولوا كلمة" مع نظام النقاط والمنافسة</p>
                  <div className="flex items-center text-purple-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link> */}
<Link href="/player-career" className="group">
  <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/50">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <span className="text-2xl">⚽</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">مسيرة اللاعبين</h3>
      <p className="text-gray-400 mb-4">تتبع مسيرة النجوم واكتشف اللاعب - فريقين يتسابقان!</p>
      <div className="flex items-center text-purple-400 font-semibold">
        <span>ابدأ الآن</span>
        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </div>
    </div>
  </div>
</Link>
            {/* فقرة QR */}
            <Link href="/qr-game" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-orange-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">فقرة QR</h3>
                  <p className="text-gray-400 mb-4">امسح أكواد QR لكشف الأسئلة والتحديات</p>
                  <div className="flex items-center text-orange-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* لعبة النرد */}
            <Link href="/dice" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-yellow-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🎲</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">لعبة النرد</h3>
                  <p className="text-gray-400 mb-4">ارمِ النردين واجب على الأسئلة حسب النتيجة</p>
                  <div className="flex items-center text-yellow-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* لعبة المزاد */}
            <Link href="/auction" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-amber-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">لعبة المزاد</h3>
                  <p className="text-gray-400 mb-4">زايد على الأسئلة واربح النقاط </p>
                  <div className="flex items-center text-amber-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* خمن الخطأ */}
            <Link href="/guess-wrong" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-red-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">خمن الخطأ</h3>
                  <p className="text-gray-400 mb-4">تجنب اختيار الشخص الصحيح في هذا التحدي المثير</p>
                  <div className="flex items-center text-red-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* التلميحات التدريجية */}
            <Link href="/clues" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-indigo-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">💡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">التلميحات التدريجية</h3>
                  <p className="text-gray-400 mb-4">تلميحات متدرجة لحل الألغاز    </p>
                  <div className="flex items-center text-indigo-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* بطولة المعرفة */}
            <Link href="/tournament" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-emerald-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🏟️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3"> بطولة الإقصاء</h3>
                  <p className="text-gray-400 mb-4">شجرة بطولة    </p>
                  <div className="flex items-center text-emerald-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
         <Link href="/betting" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-yellow-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">لعبة الرهان</h3>
                  <p className="text-gray-400 mb-4">راهن على إجاباتك - اربح أو اخسر النقاط!</p>
                  <div className="flex items-center text-yellow-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>


            <Link href="/photo-comment" className="group">
  <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-orange-500/50">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <span className="text-2xl">📸</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">صورة وتعليق</h3>
      <p className="text-gray-400 mb-4">ضع تعليقك وخمن من كتب كل تعليق!</p>
      <div className="flex items-center text-orange-400 font-semibold">
        <span>ابدأ الآن</span>
        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </div>
    </div>
  </div>
</Link>

            {/* لعبة الهيمنة (Risk) */}
            <Link href="/risk" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-green-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-lime-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-lime-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">⚔️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">الهيمنة</h3>
                  <p className="text-gray-400 mb-4">لعبة الاستراتيجية والسيطرة على العالم</p>
                  <div className="flex items-center text-green-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* خريطة أوروبا */}
            <Link href="/europe" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-sky-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🇪🇺</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">خريطة أوروبا</h3>
                  <p className="text-gray-400 mb-4">اكتشف دول أوروبا    </p>
                  <div className="flex items-center text-blue-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* الخريطة العربية */}
            <Link href="/arab" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-teal-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🕌</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">الخريطة العربية</h3>
                  <p className="text-gray-400 mb-4">رحلة في الوطن العربي من المحيط إلى الخليج</p>
                  <div className="flex items-center text-teal-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* خمن مين */}
            <Link href="/guess-who" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-violet-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl">🤔</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">خمن مين</h3>
                  <p className="text-gray-400 mb-4">لعبة تخمين الشخصيات بالأسئلة الذكية</p>
                  <div className="flex items-center text-violet-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
<Link href="/question-answer" className="group">
  <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/50">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <span className="text-3xl">🎯</span>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3">سؤال و جواب</h3>
      <p className="text-gray-400 mb-4">
        اختر 6 أنواع أسئلة    واستمتع بالتحدي المعرفي مع الأصدقاء
      </p>
        <div className="flex items-center text-violet-400 font-semibold">
                    <span>ابدأ الآن</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
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