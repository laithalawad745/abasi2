// components/ChoiceQuestion.jsx
import React from 'react';

export default function ChoiceQuestion({ 
  currentChoiceQuestion, 
  showChoiceAnswers, 
  selectedAnswers,
  finishChoiceAnswering,
  awardChoicePoints,
  awardChoicePointsBoth,
  closeChoiceQuestion 
}) {
  if (!currentChoiceQuestion) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl mx-2 sm:mx-0">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl sm:rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* عنوان السؤال */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl sm:rounded-2xl shadow-xl mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white/90 text-xs sm:text-sm font-medium">سؤال الاختيارات</p>
                  <p className="text-white font-bold text-lg sm:text-xl">رقم {currentChoiceQuestion.order}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-relaxed break-words">
                  {currentChoiceQuestion.question}
                </h2>
              </div>
            </div>

            {!showChoiceAnswers ? (
              /* مرحلة الانتظار */
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">جاري عرض السؤال...</h3>
                  <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 px-2">انتظر حتى ينتهي الفريقان من قراءة السؤال</p>
                </div>
                
                <button
                  onClick={finishChoiceAnswering}
                  className="group relative px-6 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    عرض الإجابات
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl sm:rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
                </button>
              </div>
            ) : (
              /* مرحلة عرض الإجابات وتوزيع النقاط */
              <div>
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-center text-white mb-4 sm:mb-6">الإجابات وتوزيع النقاط</h3>
                  <p className="text-gray-400 text-center mb-6 sm:mb-8 text-sm sm:text-base px-2">اختر الفريق الذي أجاب صح على كل إجابة</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {currentChoiceQuestion.answers.map((answer, index) => {
                    const answerKey = `answer_${index}`;
                    const isSelected = selectedAnswers[answerKey];
                    
                    return (
                      <div key={index} className="relative group">
                        <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all duration-500 ${
                          isSelected 
                            ? isSelected === 'red'
                              ? 'bg-gradient-to-br from-red-500/30 to-pink-500/30 border-red-400/50'
                              : isSelected === 'blue'
                              ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50'
                              : 'bg-gradient-to-br from-purple-500/30 to-violet-500/30 border-purple-400/50'
                            : 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/30'
                        }`}>
                          
                          <div className="text-center mb-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-base sm:text-lg break-words mb-2">{answer.answer}</p>
                              <p className="text-yellow-400 text-lg sm:text-xl font-bold">
                                {answer.points} نقطة
                              </p>
                            </div>
                          </div>

                          {/* أزرار منح النقاط */}
                          {!isSelected && (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <button
                                onClick={() => awardChoicePoints(index, 'red')}
                                className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                              >
                                🔴 أحمر
                              </button>
                              <button
                                onClick={() => awardChoicePointsBoth(index)}
                                className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                              >
                                ⚪ كلاهما
                              </button>
                              <button
                                onClick={() => awardChoicePoints(index, 'blue')}
                                className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                              >
                                🔵 أزرق
                              </button>
                            </div>
                          )}

                          {/* عرض النتيجة إذا تم اختيار فريق */}
                          {isSelected && (
                            <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl border border-green-400/30">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-green-400 font-bold text-sm sm:text-base">
                                  {isSelected === 'both' ? 
                                   'منح للفريقين' :
                                   isSelected === 'red' ? 'منح للفريق الأحمر' : 'منح للفريق الأزرق'}
                                  - {answer.points} نقطة
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* زر الإغلاق */}
                <div className="text-center mt-6 sm:mt-8">
                  <button
                    onClick={closeChoiceQuestion}
                    className="group relative px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                  >
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      إغلاق السؤال
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-xl sm:rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}