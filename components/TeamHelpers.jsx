// components/TeamHelpers.jsx
import React from 'react';

export default function TeamHelpers({ 
  helpers, 
  currentTurn, 
  currentQuestion, 
  currentChoiceQuestion,
  useNumber2Helper,
  usePitHelper 
}) {
  return (
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {/* وسائل الفريق الأحمر */}
      <div className="relative group">
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-red-400/30 transition-all duration-500">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">وسائل الفريق الأحمر</h3>
          </div>
          
          <div className="flex justify-center gap-4">
            {/* وسيلة 2x */}
            <button
              onClick={() => useNumber2Helper('red')}
              disabled={!helpers.red.number2 || currentTurn !== 'red' || currentQuestion !== null || currentChoiceQuestion !== null}
              className={`relative group/btn px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center gap-2 min-w-[80px] ${
                helpers.red.number2 && currentTurn === 'red' && currentQuestion === null && currentChoiceQuestion === null
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:scale-105 border-2 border-yellow-400/50'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed border-2 border-white/10'
              }`}
            >
              <div className="text-2xl">2️⃣</div>
              <span className="text-sm">مضاعف</span>
              
              {helpers.red.number2 && currentTurn === 'red' && currentQuestion === null && currentChoiceQuestion === null && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300"></div>
              )}
            </button>
            
            {/* وسيلة الحفرة */}
            <button
              onClick={() => usePitHelper('red')}
              disabled={!helpers.red.pit || currentTurn !== 'red' || currentQuestion !== null || currentChoiceQuestion !== null}
              className={`relative group/btn px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center gap-2 min-w-[80px] ${
                helpers.red.pit && currentTurn === 'red' && currentQuestion === null && currentChoiceQuestion === null
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-lg hover:scale-105 border-2 border-orange-400/50'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed border-2 border-white/10'
              }`}
            >
              <div className="text-2xl">🕳️</div>
              <span className="text-sm">حفرة</span>
              
              {helpers.red.pit && currentTurn === 'red' && currentQuestion === null && currentChoiceQuestion === null && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300"></div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* وسائل الفريق الأزرق */}
      <div className="relative group">
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-blue-400/30 transition-all duration-500">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">وسائل الفريق الأزرق</h3>
          </div>
          
          <div className="flex justify-center gap-4">
            {/* وسيلة 2x */}
            <button
              onClick={() => useNumber2Helper('blue')}
              disabled={!helpers.blue.number2 || currentTurn !== 'blue' || currentQuestion !== null || currentChoiceQuestion !== null}
              className={`relative group/btn px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center gap-2 min-w-[80px] ${
                helpers.blue.number2 && currentTurn === 'blue' && currentQuestion === null && currentChoiceQuestion === null
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:scale-105 border-2 border-yellow-400/50'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed border-2 border-white/10'
              }`}
            >
              <div className="text-2xl">2️⃣</div>
              <span className="text-sm">مضاعف</span>
              
              {helpers.blue.number2 && currentTurn === 'blue' && currentQuestion === null && currentChoiceQuestion === null && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300"></div>
              )}
            </button>
            
            {/* وسيلة الحفرة */}
            <button
              onClick={() => usePitHelper('blue')}
              disabled={!helpers.blue.pit || currentTurn !== 'blue' || currentQuestion !== null || currentChoiceQuestion !== null}
              className={`relative group/btn px-6 py-4 rounded-2xl font-bold transition-all duration-300 flex flex-col items-center gap-2 min-w-[80px] ${
                helpers.blue.pit && currentTurn === 'blue' && currentQuestion === null && currentChoiceQuestion === null
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-lg hover:scale-105 border-2 border-orange-400/50'
                  : 'bg-white/10 text-gray-400 cursor-not-allowed border-2 border-white/10'
              }`}
            >
              <div className="text-2xl">🕳️</div>
              <span className="text-sm">حفرة</span>
              
              {helpers.blue.pit && currentTurn === 'blue' && currentQuestion === null && currentChoiceQuestion === null && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-2xl blur group-hover/btn:blur-md transition-all duration-300"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}