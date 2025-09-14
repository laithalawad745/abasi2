// components/Modals.jsx
import React from 'react';

// Image Modal Component
export function ImageModal({ zoomedImage, closeZoomedImage }) {
  if (!zoomedImage) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={closeZoomedImage}
    >
      <div className="relative max-w-full max-h-full group">
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-2xl">
          <img 
            src={zoomedImage}
            alt="صورة مكبرة"
            className="max-w-full max-h-full object-contain rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={closeZoomedImage} 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600/6366F1/FFFFFF?text=صورة+السؤال';
            }}
          />
          
          {/* زر الإغلاق */}
          <button
            onClick={closeZoomedImage}
            className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        
        {/* تأثير الإضاءة */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
      </div>
    </div>
  );
}

// Confirm Modal Component  
export function ConfirmModal({ showConfirmReset, setShowConfirmReset, resetGame }) {
  if (!showConfirmReset) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-md w-full group">
        <div className="p-8 bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-center">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* أيقونة التحذير */}
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h2 className="text-2xl md:text-3xl text-white font-bold mb-4">هل أنت متأكد؟</h2>
            <p className="text-gray-400 text-lg mb-8">ستفقد جميع التقدم الحالي في اللعبة</p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  resetGame(false);
                  setShowConfirmReset(false);
                }}
                className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                  </svg>
                  نعم، إعادة تعيين اللعبة
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-600/20 rounded-2xl blur group-hover:blur-md transition-all duration-300 -z-10"></div>
              </button>
              
              <button
                onClick={() => setShowConfirmReset(false)}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white rounded-2xl font-bold hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  إلغاء
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* تأثير الإضاءة */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
      </div>
    </div>
  );
}