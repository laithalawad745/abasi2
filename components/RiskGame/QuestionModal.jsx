// components/RiskGame/QuestionModal.jsx
import React, { useState, useEffect } from 'react';

export default function QuestionModal({ question, onAnswer, onClose }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(true);

  // العد التنازلي
  useEffect(() => {
    if (timerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && timerActive) {
      // انتهى الوقت
      setTimerActive(false);
      handleAnswer(false, 'easy');
    }
  }, [timer, timerActive]);

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setTimerActive(false);
  };

  const handleAnswer = (isCorrect, difficulty) => {
    onAnswer(isCorrect, difficulty || selectedDifficulty);
  };

  const showAnswerAndContinue = () => {
    setShowAnswer(true);
    setTimerActive(false);
  };

  const getActionText = () => {
    switch (question.actionType) {
      case 'occupy': return 'احتلال دولة جديدة';
      case 'attack': return 'مهاجمة دولة مجاورة';
      case 'reinforce': return 'تقوية دولة مملوكة';
      default: return 'سؤال';
    }
  };

  const getTroopsText = (difficulty) => {
    const troops = {
      easy: 5,
      medium: 10, 
      hard: 20
    };
    const bonus = question.actionType === 'attack' ? ' + 15 هدية' : '';
    return `${troops[difficulty]} جندي${bonus}`;
  };

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600 rounded-3xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{getActionText()}</h2>
            
            {/* Timer */}
            {timerActive && (
              <div className={`px-4 py-2 rounded-full font-bold ${
                timer > 10 ? 'bg-green-500' : timer > 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <span className="text-white text-xl">{timer}s</span>
              </div>
            )}
          </div>
          
          <div className="text-gray-300">اختر مستوى الصعوبة أولاً</div>
        </div>

        {/* اختيار الصعوبة */}
        {!selectedDifficulty && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => handleDifficultySelect('easy')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:scale-105"
            >
              <div className="text-xl mb-2">سهل</div>
              <div className="text-sm opacity-90">{getTroopsText('easy')}</div>
            </button>
            
            <button
              onClick={() => handleDifficultySelect('medium')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:scale-105"
            >
              <div className="text-xl mb-2">متوسط</div>
              <div className="text-sm opacity-90">{getTroopsText('medium')}</div>
            </button>
            
            <button
              onClick={() => handleDifficultySelect('hard')}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:scale-105"
            >
              <div className="text-xl mb-2">صعب</div>
              <div className="text-sm opacity-90">{getTroopsText('hard')}</div>
            </button>
          </div>
        )}

        {/* السؤال */}
        {selectedDifficulty && (
          <>
            <div className="bg-slate-700/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-2 rounded-full text-white font-bold ${
                  selectedDifficulty === 'easy' ? 'bg-green-500' :
                  selectedDifficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {getTroopsText(selectedDifficulty)}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">{question.question}</h3>
              
              {/* عرض الوسائط */}
              {question.hasImage && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={question.imageUrl} 
                    alt="صورة السؤال" 
                    className="max-w-full max-h-64 object-contain rounded-lg"
                  />
                </div>
              )}
              
              {question.hasVideo && (
                <div className="flex justify-center mb-4">
                  <video 
                    src={question.videoUrl} 
                    controls
                    className="max-w-full max-h-64 rounded-lg"
                  />
                </div>
              )}
              
              {question.hasAudio && (
                <div className="flex justify-center mb-4">
                  <audio 
                    controls
                    src={question.audioUrl}
                    className="w-full max-w-md"
                  />
                </div>
              )}
              
              {question.hasQR && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={question.qrImageUrl} 
                    alt="QR Code" 
                    className="max-h-48 object-contain"
                  />
                </div>
              )}
            </div>

            {/* أزرار الجواب */}
            {!showAnswer ? (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleAnswer(true, selectedDifficulty)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
                >
                  ✅ إجابة صحيحة
                </button>
                
                <button
                  onClick={showAnswerAndContinue}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
                >
                  👁️ إظهار الجواب
                </button>
                
                <button
                  onClick={() => handleAnswer(false, selectedDifficulty)}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
                >
                  ❌ إجابة خاطئة
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-blue-500/20 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-blue-400 mb-2">الجواب الصحيح:</h4>
                  <p className="text-white text-xl">{question.answer}</p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleAnswer(true, selectedDifficulty)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
                  >
                    ✅ أجاب صحيح
                  </button>
                  
                  <button
                    onClick={() => handleAnswer(false, selectedDifficulty)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
                  >
                    ❌ أجاب خطأ
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}