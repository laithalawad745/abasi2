// components/TopicGrid.jsx
import React from 'react';

export default function TopicGrid({ 
  selectedTopics,
  currentTurn,
  currentQuestion,
  currentChoiceQuestion,
  usedChoiceQuestions,
  selectChoiceQuestion,
  selectRandomQuestionForTeam,
  isQuestionAvailable,
  getAvailableQuestionsCount,
  hasUsedQuestionsInLevel,
  setShowConfirmReset
}) {
  return (
    <div className="relative z-10 mb-8">
      {/* عنوان الشبكة */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">شبكة الأسئلة</h2>
        <p className="text-gray-400 text-lg">اختر السؤال المناسب لفريقك</p>
      </div>

      <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {selectedTopics.map(topic => {
            if (topic.id === 'choices') {
              // عرض أسئلة الاختيارات
              return (
                <div key={topic.id} className="relative group">
                  <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-purple-400/30 transition-all duration-500">
                    {/* عنوان الموضوع */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">{topic.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* الفريق الأحمر */}
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-red-400">الفريق الأحمر</p>
                        </div>
                        {[1, 3, 5, 7].map(order => {
                          const isUsed = usedChoiceQuestions.includes(order);
                          const canSelect = currentTurn === 'red' && !isUsed && !currentQuestion && !currentChoiceQuestion;
                          
                          return (
                            <button
                              key={`choice-red-${order}`}
                              onClick={() => selectChoiceQuestion(order)}
                              disabled={!canSelect}
                              className={`relative w-full p-4 rounded-2xl font-bold transition-all duration-300 border-2 group/btn ${
                                isUsed
                                  ? 'bg-white/10 text-gray-400 border-white/10 cursor-not-allowed' 
                                  : canSelect
                                  ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-white border-red-400/50 hover:border-red-400 hover:scale-105 shadow-lg'
                                  : 'bg-white/5 text-gray-500 cursor-not-allowed border-white/10'
                              }`}
                            >
                              <span className="text-lg">
                                {isUsed ? '✅ مكتمل' : `سؤال ${order}`}
                              </span>
                              
                              {canSelect && (
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* الفريق الأزرق */}
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-blue-400">الفريق الأزرق</p>
                        </div>
                        {[2, 4, 6, 8].map(order => {
                          const isUsed = usedChoiceQuestions.includes(order);
                          const canSelect = currentTurn === 'blue' && !isUsed && !currentQuestion && !currentChoiceQuestion;
                          
                          return (
                            <button
                              key={`choice-blue-${order}`}
                              onClick={() => selectChoiceQuestion(order)}
                              disabled={!canSelect}
                              className={`relative w-full p-4 rounded-2xl font-bold transition-all duration-300 border-2 group/btn ${
                                isUsed
                                  ? 'bg-white/10 text-gray-400 border-white/10 cursor-not-allowed'
                                  : canSelect
                                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-white border-blue-400/50 hover:border-blue-400 hover:scale-105 shadow-lg'
                                  : 'bg-white/5 text-gray-500 cursor-not-allowed border-white/10'
                              }`}
                            >
                              <span className="text-lg">
                                {isUsed ? '✅ مكتمل' : `سؤال ${order}`}
                              </span>
                              
                              {canSelect && (
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              // عرض الأسئلة العادية
              return (
                <div key={topic.id} className="relative group">
                  <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-emerald-400/30 transition-all duration-500">
                    {/* عنوان الموضوع */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">{topic.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* الفريق الأحمر */}
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-red-400">أحمر</p>
                        </div>
                        {['easy', 'medium', 'hard'].map(difficulty => {
                          const points = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 600;
                          const hasTeamUsedThisLevel = hasUsedQuestionsInLevel(topic.id, difficulty, 'red');
                          const isAvailable = isQuestionAvailable(topic.id, difficulty, 'red');
                          const availableCount = getAvailableQuestionsCount(topic.id, difficulty, 'red');
                          const isDisabled = !isAvailable || currentQuestion !== null || currentChoiceQuestion !== null || currentTurn !== 'red' || hasTeamUsedThisLevel;
                          
                          const getDifficultyColor = () => {
                            if (difficulty === 'easy') return 'from-green-400 to-emerald-600';
                            if (difficulty === 'medium') return 'from-yellow-400 to-orange-600';
                            return 'from-red-400 to-pink-600';
                          };
                          
                          return (
                            <button
                              key={`${topic.id}-red-${difficulty}`}
                              onClick={() => selectRandomQuestionForTeam(topic.id, difficulty, 'red')}
                              disabled={isDisabled}
                              className={`relative w-full p-4 rounded-2xl font-bold transition-all duration-300 border-2 group/btn ${
                                hasTeamUsedThisLevel
                                  ? 'bg-white/10 text-gray-400 border-white/10 cursor-not-allowed'
                                  : !isAvailable
                                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border-white/10'
                                  : currentTurn === 'red' && currentQuestion === null && currentChoiceQuestion === null
                                  ? `bg-gradient-to-br ${getDifficultyColor()}/20 hover:${getDifficultyColor()}/30 text-white border-red-400/50 hover:border-red-400 hover:scale-105 shadow-lg`
                                  : 'bg-white/5 text-gray-500 cursor-not-allowed border-white/10'
                              }`}
                              title={hasTeamUsedThisLevel ? 'تم استخدامه' : `أسئلة متاحة: ${availableCount}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-lg font-bold">
                                  {hasTeamUsedThisLevel ? '✅' : !isAvailable ? '❌' : `${points}`}
                                </span>
                                <span className="text-xs opacity-75">
                                  {difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}
                                </span>
                              </div>
                              
                              {!hasTeamUsedThisLevel && isAvailable && currentTurn === 'red' && currentQuestion === null && currentChoiceQuestion === null && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor()}/10 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300`}></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* الفريق الأزرق */}
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-blue-400">أزرق</p>
                        </div>
                        {['easy', 'medium', 'hard'].map(difficulty => {
                          const points = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 400 : 600;
                          const hasTeamUsedThisLevel = hasUsedQuestionsInLevel(topic.id, difficulty, 'blue');
                          const isAvailable = isQuestionAvailable(topic.id, difficulty, 'blue');
                          const availableCount = getAvailableQuestionsCount(topic.id, difficulty, 'blue');
                          const isDisabled = !isAvailable || currentQuestion !== null || currentChoiceQuestion !== null || currentTurn !== 'blue' || hasTeamUsedThisLevel;
                          
                          const getDifficultyColor = () => {
                            if (difficulty === 'easy') return 'from-green-400 to-emerald-600';
                            if (difficulty === 'medium') return 'from-yellow-400 to-orange-600';
                            return 'from-red-400 to-pink-600';
                          };
                          
                          return (
                            <button
                              key={`${topic.id}-blue-${difficulty}`}
                              onClick={() => selectRandomQuestionForTeam(topic.id, difficulty, 'blue')}
                              disabled={isDisabled}
                              className={`relative w-full p-4 rounded-2xl font-bold transition-all duration-300 border-2 group/btn ${
                                hasTeamUsedThisLevel
                                  ? 'bg-white/10 text-gray-400 border-white/10 cursor-not-allowed'
                                  : !isAvailable
                                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border-white/10'
                                  : currentTurn === 'blue' && currentQuestion === null && currentChoiceQuestion === null
                                  ? `bg-gradient-to-br ${getDifficultyColor()}/20 hover:${getDifficultyColor()}/30 text-white border-blue-400/50 hover:border-blue-400 hover:scale-105 shadow-lg`
                                  : 'bg-white/5 text-gray-500 cursor-not-allowed border-white/10'
                              }`}
                              title={hasTeamUsedThisLevel ? 'تم استخدامه' : `أسئلة متاحة: ${availableCount}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-lg font-bold">
                                  {hasTeamUsedThisLevel ? '✅' : !isAvailable ? '❌' : `${points}`}
                                </span>
                                <span className="text-xs opacity-75">
                                  {difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}
                                </span>
                              </div>
                              
                              {!hasTeamUsedThisLevel && isAvailable && currentTurn === 'blue' && currentQuestion === null && currentChoiceQuestion === null && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor()}/10 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300`}></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
        
        {/* زر إعادة التعيين */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowConfirmReset(true)}
            className="group px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 hover:border-red-400/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              إعادة تعيين اللعبة
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}