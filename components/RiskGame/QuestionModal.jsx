// components/RiskGame/QuestionModal.jsx - بالتصميم الجديد
import React, { useState } from 'react';

export default function QuestionModal({ 
  question, 
  onAnswer, 
  onClose, 
  actionType, 
  selectedCountry, 
  targetCountry 
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  // الحصول على عنوان العملية
  const getActionTitle = () => {
    switch (actionType) {
      case 'occupy':
        return `🏴 احتلال ${selectedCountry}`;
      case 'attack':
        return `⚔️ مهاجمة ${targetCountry}`;
      case 'reinforce':
        return `🛡️ تقوية ${selectedCountry}`;
      default:
        return 'سؤال المعرفة';
    }
  };

  // الحصول على وصف المكافآت/العواقب
  const getRewardsDescription = () => {
    const difficultyRewards = {
      easy: '5 جنود',
      medium: '10 جنود', 
      hard: '20 جندي'
    };

    const reward = difficultyRewards[question.difficulty] || '5 جنود';

    switch (actionType) {
      case 'occupy':
        return (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-6">
            <div className="text-blue-300 font-bold mb-2 text-lg">🎯 مكافآت الاحتلال:</div>
            <div className="text-blue-200">
              ✅ إجابة صحيحة: احتلال الدولة بـ {reward}<br/>
              ❌ إجابة خاطئة: فشل الاحتلال
            </div>
          </div>
        );
      case 'attack':
        return (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
            <div className="text-red-300 font-bold mb-2 text-lg">⚔️ نتائج الهجوم:</div>
            <div className="text-red-200">
              ✅ إجابة صحيحة: احتلال {targetCountry} + 15 جندي<br/>
              ❌ إجابة خاطئة: خسارة نصف جيش {selectedCountry}
            </div>
          </div>
        );
      case 'reinforce':
        return (
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 mb-6">
            <div className="text-green-300 font-bold mb-2 text-lg">🛡️ مكافآت التقوية:</div>
            <div className="text-green-200">
              ✅ إجابة صحيحة: إضافة {reward}<br/>
              ❌ إجابة خاطئة: لا توجد مكافآت
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                {getActionTitle()}
              </span>
            </h2>
            
            <button
              onClick={onClose}
              className="w-12 h-12 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-300 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105"
            >
              ✕
            </button>
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className={`px-4 py-2 rounded-xl font-bold text-lg ${
              question.difficulty === 'easy' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
              question.difficulty === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
              'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}>
              {question.difficulty === 'easy' ? '🟢 سهل' : 
               question.difficulty === 'medium' ? '🟡 متوسط' : '🔴 صعب'}
            </div>
          </div>
        </div>

        {/* Rewards/Consequences */}
        {getRewardsDescription()}

        {/* Question Content */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-white leading-relaxed">
            {question.question}
          </h3>

          {/* Media Content */}
          {question.hasImage && (
            <div className="text-center mb-4">
              <img 
                src={question.imageUrl} 
                alt="صورة السؤال"
                className="max-w-full max-h-64 mx-auto rounded-xl shadow-lg border border-white/10"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {question.hasAudio && (
            <div className="text-center mb-4">
              <audio 
                controls 
                className="mx-auto rounded-xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              >
                <source src={question.audioUrl} type="audio/mpeg" />
                متصفحك لا يدعم تشغيل الصوت
              </audio>
            </div>
          )}

          {question.hasVideo && (
            <div className="text-center mb-4">
              <video 
                controls 
                className="max-w-full max-h-64 mx-auto rounded-xl border border-white/10"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              >
                <source src={question.videoUrl} type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
          )}
        </div>

        {!showAnswer ? (
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-6">فكر جيداً قبل الإجابة...</p>
            <button
              onClick={() => setShowAnswer(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              💡 عرض الإجابة
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Answer Display */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
              <h4 className="text-2xl font-bold text-green-300 mb-4">
                ✅ الإجابة الصحيحة:
              </h4>
              <p className="text-xl md:text-2xl text-white font-bold">
                {question.answer}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => onAnswer(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
              >
                ✅ أجاب صحيح
              </button>
              
              <button
                onClick={() => onAnswer(false)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30"
              >
                ❌ أجاب خطأ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}