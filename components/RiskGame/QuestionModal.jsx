// components/RiskGame/QuestionModal.jsx
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
          <div className="bg-blue-900/30 rounded-lg p-3 mb-4">
            <div className="text-blue-300 font-bold mb-2">مكافآت الاحتلال:</div>
            <div className="text-sm text-blue-200">
              ✅ إجابة صحيحة: احتلال الدولة بـ {reward}<br/>
              ❌ إجابة خاطئة: فشل الاحتلال
            </div>
          </div>
        );
      case 'attack':
        return (
          <div className="bg-red-900/30 rounded-lg p-3 mb-4">
            <div className="text-red-300 font-bold mb-2">نتائج الهجوم:</div>
            <div className="text-sm text-red-200">
              ✅ إجابة صحيحة: احتلال {targetCountry} + 15 جندي<br/>
              ❌ إجابة خاطئة: خسارة نصف جيش {selectedCountry}
            </div>
          </div>
        );
      case 'reinforce':
        return (
          <div className="bg-green-900/30 rounded-lg p-3 mb-4">
            <div className="text-green-300 font-bold mb-2">نتائج التقوية:</div>
            <div className="text-sm text-green-200">
              ✅ إجابة صحيحة: إضافة {reward} لـ {selectedCountry}<br/>
              ❌ إجابة خاطئة: خسارة 25% من جيش {selectedCountry}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // الحصول على لون الصعوبة
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // الحصول على نص الصعوبة
  const getDifficultyText = () => {
    switch (question.difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return 'غير محدد';
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleFinalAnswer = (isCorrect) => {
    onAnswer(isCorrect);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-600 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {getActionTitle()}
          </h2>
          <div className="flex justify-center items-center gap-2">
            <span className={`font-bold ${getDifficultyColor()}`}>
              {getDifficultyText()}
            </span>
            <span className="text-gray-300"  > : صعوبة السؤال </span>
            {/* <span className="text-gray-300">
              ({question.points} نقطة)
            </span> */}
          </div>
        </div>

        {/* Rewards/Consequences */}
        {getRewardsDescription()}

        {/* Question Content */}
        <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-slate-100">
            {question.question}
          </h3>

          {/* Media Content */}
          {question.hasImage && (
            <div className="text-center mb-4">
              <img 
                src={question.imageUrl} 
                alt="صورة السؤال"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
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
                className="mx-auto"
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
                className="max-w-full max-h-64 mx-auto rounded-lg"
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
          /* Show Question - Voice Answer */
          <div className="space-y-6">
            {/* <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
              <div className="text-yellow-300 font-bold mb-2">🎤 إجابة شفهية</div>
              <div className="text-sm text-yellow-200">
                ناقش الإجابة مع فريقك في ديسكورد، ثم اضغط على "عرض الإجابة" للتحقق من صحتها
              </div>
            </div> */}

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleShowAnswer}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
              >
                عرض الإجابة الصحيحة
              </button>
              {/* <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                إلغاء
              </button> */}
            </div>
          </div>
        ) : (
          /* Show Answer and Decision */
          <div className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-gray-300 mb-2">الإجابة الصحيحة:</div>
                <div className="text-xl font-bold text-green-400">
                  {question.answer}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-white font-bold mb-4">
                هل كانت إجابتكم  صحيحة؟
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleFinalAnswer(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
                >
                  ✅ صحيحة
                </button>
                <button
                  onClick={() => handleFinalAnswer(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
                >
                  ❌ خاطئة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 pt-4 border-t border-slate-600">
          {/* <div className="text-xs text-gray-400 text-center">
            💡 نصيحة: ناقش السؤال مع فريقك في ديسكورد قبل عرض الإجابة!
          </div> */}
        </div>
      </div>
    </div>
  );
}