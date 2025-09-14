// components/GameSetup.jsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function GameSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 select-none flex flex-col">
      {/* Header */}
      <div className='flex justify-between p-4 md:p-8'>
        <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
          Absi
        </h1>
        <a 
          href="/contact" 
          className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          Contact
        </a>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
        <div className="text-center space-y-8">
          {/* العنوان الرئيسي */}
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
            قومبز جيم 
          </h1>
          
          {/* أزرار الألعاب - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* المباراة الكاملة */}
            <Link
              href="/full-match"
              className="bg-gradient-to-r cursor-pointer from-purple-600 via-pink-500 to-blue-500 hover:from-purple-700 hover:via-pink-600 hover:to-blue-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-purple-400/50 hover:border-pink-400/70 flex items-center justify-center text-center"
            >
               المباراة الكاملة
            </Link>

            {/* فقرة من أسرع */}
            <button
              onClick={() => window.location.href = '/fastest'}
              className="bg-gradient-to-r cursor-pointer from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-orange-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-orange-400/50 hover:border-red-400/70"
            >
             من أسرع
            </button>

            {/* بطولة المعرفة */}
            <button
              onClick={() => window.location.href = '/tournament'}
              className="bg-gradient-to-r cursor-pointer from-yellow-600 via-orange-500 to-red-500 hover:from-yellow-700 hover:via-orange-600 hover:to-red-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-yellow-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-yellow-400/50 hover:border-orange-400/70"
            >
               الإقصاء
            </button>

            {/* لعبة المزاد - جديد */}
            <button
              onClick={() => window.location.href = '/auction'}
              className="bg-gradient-to-r cursor-pointer from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-amber-400/50 hover:border-orange-400/70"
            >
              🏆 لعبة المزاد
            </button>

            {/* لعبة النرد */}
            <button
              onClick={() => window.location.href = '/dice'}
              className="bg-gradient-to-r cursor-pointer from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-indigo-400/50 hover:border-purple-400/70"
            >
              🎲 لعبة النرد
            </button>

            {/* من هو؟ */}
            <button
              onClick={() => window.location.href = '/guess-who'}
              className="bg-gradient-to-r cursor-pointer from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-teal-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-teal-400/50 hover:border-cyan-400/70"
            >
              🕵️ من هو؟
            </button>

            {/* الهيمنة (Risk Game) */}
            <button
              onClick={() => window.location.href = '/risk'}
              className="bg-gradient-to-r cursor-pointer from-green-600 via-emerald-500 to-teal-500 hover:from-green-700 hover:via-emerald-600 hover:to-teal-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-green-400/50 hover:border-emerald-400/70"
            >
              🌍 الهيمنة
            </button>

            {/* الخرائط - Europe */}
            <button
              onClick={() => window.location.href = '/europe'}
              className="bg-gradient-to-r cursor-pointer from-blue-600 via-indigo-500 to-purple-500 hover:from-blue-700 hover:via-indigo-600 hover:to-purple-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-blue-400/50 hover:border-indigo-400/70"
            >
              🗺️ خريطة أوروبا
            </button>

            {/* الخرائط - Arab */}
            <button
              onClick={() => window.location.href = '/arab'}
              className="bg-gradient-to-r cursor-pointer from-emerald-600 via-green-500 to-lime-500 hover:from-emerald-700 hover:via-green-600 hover:to-lime-600 text-white px-8 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 rounded-2xl font-bold text-xl md:text-2xl lg:text-3xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 transform border-2 border-emerald-400/50 hover:border-green-400/70"
            >
              🕌 خريطة العرب
            </button>

          </div>
          
          {/* معلومات إضافية */}
          <div className="mt-12 text-center">
            <p className="text-lg md:text-xl text-slate-300 mb-4">
              منصة ألعاب تفاعلية باللغة العربية
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-slate-400 text-sm md:text-base">
              <span>🎮 ألعاب متعددة اللاعبين</span>
              <span>🧠 أسئلة ثقافية متنوعة</span>
              <span>🏆 تحديات مثيرة</span>
              <span>📱 متجاوب مع جميع الأجهزة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}