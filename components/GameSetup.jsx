// components/GameSetup.jsx
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
            <Link href="/full-match" className="group">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-cyan-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">المباراة الكاملة</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">تجربة شاملة مع جميع المواضيع والتحديات</p>
                </div>
              </div>
            </Link>

            {/* من أسرع */}
            <div onClick={() => window.location.href = '/fastest'} className="group cursor-pointer">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-orange-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">من أسرع</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">تحدى سرعتك في الإجابة ضد المنافسين</p>
                </div>
              </div>
            </div>

            {/* الإقصاء */}
            <div onClick={() => window.location.href = '/tournament'} className="group cursor-pointer">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-yellow-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">الإقصاء</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">بطولة تنافسية لتحديد البطل الأقوى</p>
                </div>
              </div>
            </div>

            {/* لعبة المزاد */}
            <div onClick={() => window.location.href = '/auction'} className="group cursor-pointer">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-amber-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">لعبة المزاد</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">زايد على الأسئلة واربح أعلى النقاط</p>
                </div>
              </div>
            </div>

            {/* لعبة النرد */}
            <div onClick={() => window.location.href = '/dice'} className="group cursor-pointer">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2 1 1 0 100-2zm0 5a1 1 0 100 2 1 1 0 000-2zm4-5a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2zm-2 5a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">لعبة النرد</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">ارمِ النرد واجب على الأسئلة المثيرة</p>
                </div>
              </div>
            </div>

            {/* من هو؟ */}
            <div onClick={() => window.location.href = '/guess-who'} className="group cursor-pointer">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-teal-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">من هو؟</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">خمن الشخصية المختارة من خصمك</p>
                </div>
              </div>
            </div>

            {/* الهيمنة */}
            <div onClick={() => window.location.href = '/risk'} className="group cursor-pointer">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-green-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">الهيمنة</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">لعبة الاستراتيجية والسيطرة على العالم</p>
                </div>
              </div>
            </div>

            {/* خريطة أوروبا */}
            <div onClick={() => window.location.href = '/europe'} className="group cursor-pointer">
              <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-blue-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">خريطة أوروبا</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">استكشف معلومات مثيرة عن أوروبا</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center justify-center space-x-8 space-x-reverse bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
            <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>متعدد اللاعبين</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>أسئلة متنوعة</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>تحديات مثيرة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}