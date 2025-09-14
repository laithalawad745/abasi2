// components/QuestionDisplay.jsx
import React from 'react';

export default function QuestionDisplay({ 
  currentQuestion, 
  showAnswer, 
  usingPitHelper, 
  finishAnswering, 
  awardPoints, 
  noCorrectAnswer,
  zoomImage 
}) {
  if (!currentQuestion) return null;

  const getDifficultyColors = () => {
    if (currentQuestion.difficulty === 'easy') return {
      gradient: 'from-emerald-400 to-green-600',
      glow: 'shadow-emerald-500/25'
    };
    if (currentQuestion.difficulty === 'medium') return {
      gradient: 'from-yellow-400 to-orange-600', 
      glow: 'shadow-yellow-500/25'
    };
    return {
      gradient: 'from-red-400 to-pink-600',
      glow: 'shadow-red-500/25'
    };
  };

  const colors = getDifficultyColors();

  return (
    <div className="relative z-10 mb-8">
      <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl hover:border-white/20 transition-all duration-500">
        
        {/* عنوان السؤال والنقاط */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r ${colors.gradient} rounded-2xl ${colors.glow} shadow-xl mb-4`}>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white/90 text-sm font-medium">
                {currentQuestion.difficulty === 'easy' ? 'سهل' : 
                 currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </p>
              <p className="text-white font-bold text-xl">{currentQuestion.points} نقطة</p>
            </div>
          </div>
          
          {/* تحذير وسيلة الحفرة */}
          {usingPitHelper && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg animate-pulse mb-4">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-white font-bold">وسيلة الحفرة مُفعلة - تأثير خاص!</span>
            </div>
          )}
        </div>
        
        {/* نص السؤال */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>
        </div>
        
        {/* وسائل الإعلام */}
        {/* QR Code */}
        {currentQuestion.hasQR && (
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-blue-400/50 hover:border-blue-400 transition-all duration-300">
                <img 
                  src={currentQuestion.qrImageUrl} 
                  alt="QR Code" 
                  className="max-w-full max-h-64 md:max-h-80 lg:max-h-96 object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => zoomImage(currentQuestion.qrImageUrl)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300/000000/FFFFFF?text=QR+CODE';
                  }}
                />
                <p className="text-center mt-4 text-gray-800 font-bold">امسح الكود لرؤية السؤال</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
            </div>
          </div>
        )}
        
        {/* الصور العادية */}
        {currentQuestion.hasImage && !currentQuestion.hasQR && (
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <img 
                src={currentQuestion.imageUrl} 
                alt="صورة السؤال" 
                className="max-w-full max-h-64 md:max-h-80 lg:max-h-96 object-contain rounded-3xl shadow-2xl border-4 border-purple-400/50 cursor-pointer hover:border-purple-400 hover:scale-105 transition-all duration-300"
                onClick={() => zoomImage(currentQuestion.imageUrl)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x250/6366F1/FFFFFF?text=صورة+السؤال';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
            </div>
          </div>
        )}
        
        {/* الفيديو */}
        {currentQuestion.hasVideo && (
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <video 
                src={currentQuestion.videoUrl} 
                controls
                className="max-w-full max-h-64 md:max-h-80 lg:max-h-96 rounded-3xl shadow-2xl border-4 border-purple-400/50"
                onError={(e) => {
                  console.error('فشل في تحميل الفيديو:', currentQuestion.videoUrl);
                }}
                preload="metadata"
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
            </div>
          </div>
        )}
        
        {/* الصوت */}
        {currentQuestion.hasAudio && (
          <div className="flex justify-center mb-8">
            <div className="relative group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl">
              <audio 
                controls
                src={currentQuestion.audioUrl}
                className="w-full max-w-md"
                onError={(e) => {
                  console.error('فشل في تحميل الصوت:', currentQuestion.audioUrl);
                }}
              >
                متصفحك لا يدعم تشغيل الصوت
              </audio>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
            </div>
          </div>
        )}
        
        {/* أزرار التحكم */}
        {!showAnswer ? (
          <div className="text-center">
            <button
              onClick={finishAnswering}
              className="group relative px-12 py-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                انتهينا من الإجابات
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
            </button>
          </div>
        ) : (
          <div className="text-center">
            {/* صندوق الإجابة */}
            <div className="mb-8 p-8 bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-400/30 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-emerald-400">الإجابة الصحيحة</h4>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                <p className="text-2xl md:text-3xl text-white font-bold">{currentQuestion.answer}</p>
              </div>
              
              {/* صورة الجواب للـ QR Code */}
              {currentQuestion.hasQR && currentQuestion.answerImageUrl && (
                <div className="flex justify-center">
                  <div className="relative group">
                    <img 
                      src={currentQuestion.answerImageUrl} 
                      alt="صورة الجواب" 
                      className="max-w-full max-h-48 md:max-h-64 object-contain rounded-2xl shadow-lg border-2 border-emerald-400/50 cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => zoomImage(currentQuestion.answerImageUrl)}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=صورة+الجواب';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* أزرار التقييم */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => awardPoints(0)}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  الفريق الأحمر أجاب صح
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-600/20 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
              </button>
              
              <button
                onClick={noCorrectAnswer}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white rounded-2xl font-bold hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  لا أحد أجاب صح
                </div>
              </button>
              
              <button
                onClick={() => awardPoints(1)}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  الفريق الأزرق أجاب صح
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}