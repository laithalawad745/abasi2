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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8 bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* عنوان السؤال */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-xl mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white/90 text-sm font-medium">سؤال الاختيارات</p>
                  <p className="text-white font-bold text-xl">رقم {currentChoiceQuestion.order}</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                  {currentChoiceQuestion.question}
                </h2>
              </div>
            </div>

            {!showChoiceAnswers ? (
              /* مرحلة الانتظار */
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">جاري عرض السؤال...</h3>
                  <p className="text-gray-400 text-lg mb-8">انتظر حتى ينتهي الفريقان من قراءة السؤال</p>
                </div>
                
                <button
                  onClick={finishChoiceAnswering}
                  className="group relative px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    عرض الإجابات
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
                </button>
              </div>
            ) : (
              /* مرحلة عرض الإجابات وتوزيع النقاط */
              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-center text-white mb-6">الإجابات وتوزيع النقاط</h3>
                  <p className="text-gray-400 text-center mb-8">اختر الفريق الذي أجاب صح على كل إجابة</p>
                </div>

                <div className="grid gap-6">
                  {currentChoiceQuestion.answers.map((answer, index) => {
                    const answerKey = `answer_${index}`;
                    const isSelected = selectedAnswers[answerKey];
                    
                    return (
                      <div key={index} className="relative group">
                        <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${
                          isSelected 
                            ? isSelected === 'red'
                              ? 'bg-gradient-to-br from-red-500/30 to-pink-500/30 border-red-400/50'
                              : isSelected === 'blue'
                              ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50'
                              : 'bg-gradient-to-br from-purple-500/30 to-violet-500/30 border-purple-400/50'
                            : 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/30'
                        }`}>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                answer.is_correct 
                                  ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
                              }`}>
                                {answer.is_correct ? (
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg">{answer.answer}</p>
                                <p className="text-gray-400 text-sm">
                                  {answer.is_correct ? 'إجابة صحيحة' : 'إجابة خاطئة'} - {answer.points} نقطة
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* أزرار اختيار الفريق */}
                          {!isSelected && (
                            <div className="flex gap-4 justify-center">
                              <button
                                onClick={() => awardChoicePoints(index, 'red')}
                                className="group/btn relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                  </div>
                                  أحمر
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-600/20 rounded-xl blur group-hover/btn:blur-md transition-all duration-300 -z-10"></div>
                              </button>
                              
                              <button
                                onClick={() => awardChoicePointsBoth(index)}
                                className="group/btn relative px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                  </div>
                                  كلاهما
                                </div>
                              </button>
                              
                              <button
                                onClick={() => awardChoicePoints(index, 'blue')}
                                className="group/btn relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                  </div>
                                  أزرق
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl blur group-hover/btn:blur-md transition-all duration-300 -z-10"></div>
                              </button>
                            </div>
                          )}
                          
                          {/* عرض النقاط المُمنحة */}
                          {isSelected && (
                            <div className="text-center mt-4">
                              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${
                                isSelected === 'red' 
                                  ? 'bg-gradient-to-r from-red-500 to-pink-600'
                                  : isSelected === 'blue'
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                                  : 'bg-gradient-to-r from-purple-500 to-violet-600'
                              } shadow-xl`}>
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-white font-bold">
                                  {isSelected === 'both' ? 'منح للفريقين' :
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
                <div className="text-center mt-8">
                  <button
                    onClick={closeChoiceQuestion}
                    className="group relative px-12 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      إغلاق السؤال
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
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