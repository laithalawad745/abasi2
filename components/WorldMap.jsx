// components/WorldMap.jsx
import React from 'react';

export default function WorldMap({ 
  worldTopic,
  currentTurn,
  currentQuestion,
  currentChoiceQuestion,
  occupiedCountries,
  selectCountry,
  teamCountries
}) {
  if (!worldTopic) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700">
      <div className="text-center mb-6">
        {/* <h3 className="font-bold mb-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg text-lg md:text-xl">
           {worldTopic.name}
        </h3> */}
             <div className="text-center mb-2 mt-0">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold shadow-xl backdrop-blur-sm border-2 ${
          currentTurn === 'red' 
            ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-400/50 text-red-300'
            : 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-blue-400/50 text-blue-300'
        }`}>
          <span className="text-2xl">{currentTurn === 'red' ? '🔴' : '🔵'}</span>
          <span className="text-lg">
            دور {currentTurn === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
          </span>
          <span className="text-sm opacity-75">اختر دولة أوروبية للهجوم!</span>
        </div>
      </div>

        {/* <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
          <p className="text-slate-300 text-sm md:text-base mb-2">
            <span className="text-emerald-400 font-bold"> قواعد اللعب:</span> اختر دولة أوروبية للإجابة على سؤال عنها
          </p>
          <p className="text-slate-400 text-xs md:text-sm">
            كل إجابة صحيحة تحتل الدولة وتكسب نقاطها • {worldTopic.countries.length} دولة أوروبية متاحة للاحتلال
          </p>
        </div> */}
      </div>

      {/* 🖥️ عرض الخريطة للشاشات الكبيرة (مخفي على الهاتف) */}
      <div className="hidden md:block relative bg-slate-800 rounded-xl p-6 min-h-[500px] md:min-h-[600px] overflow-hidden border-2 border-slate-600/50 shadow-2xl">
        
        {/* ✅ صورة خريطة أوروبا الحقيقية كخلفية - للشاشات الكبيرة فقط */}
        <div 
          className="absolute inset-0 bg-no-repeat opacity-50 rounded-xl"
          style={{
            backgroundImage: `url('/europe-map.png')`, // ✅ خريطة أوروبا فقط
            backgroundSize: '85%',           
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* طبقة شفافة لتحسين وضوح النص */}
        <div className="absolute inset-0 bg-slate-900/30 rounded-xl"></div>

        {/* عرض الدول فوق الخريطة - للشاشات الكبيرة */}
        {worldTopic.countries.map(country => {
          const isOccupied = occupiedCountries.includes(country.id);
          const occupiedByTeam = teamCountries.red.includes(country.id) ? 'red' : 
                               teamCountries.blue.includes(country.id) ? 'blue' : null;
          const canSelect = currentTurn && !currentQuestion && !currentChoiceQuestion && !isOccupied;

          return (
            <button
              key={country.id}
              onClick={() => canSelect && selectCountry(country)}
              disabled={!canSelect}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 ${
                !canSelect ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
              }`}
              style={{
                left: `${country.position.x}%`,
                top: `${country.position.y}%`
              }}
            >
              <span className={`font-black text-sm transition-all duration-300 ${
                isOccupied
                  ? occupiedByTeam === 'red'
                    ? 'text-red-400 drop-shadow-[0_2px_4px_rgba(239,68,68,0.8)] hover:text-red-300'
                    : 'text-blue-400 drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)] hover:text-blue-300'
                  : canSelect
                  ? currentTurn === 'red'
                    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-red-300 hover:drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)]'
                    : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-blue-300 hover:drop-shadow-[0_2px_8px_rgba(59,130,246,0.6)]'
                  : 'text-gray-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] opacity-60'
              } ${canSelect ? 'hover:font-extrabold' : ''}`}>
                {country.name}
                {isOccupied && (
                  <span className="ml-1 text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">✓</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📱 عرض الشبكة للهواتف (مخفي على الشاشات الكبيرة) - ✅ بدون رموز البلدان */}
      <div className="block md:hidden">
        <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
          <p className="text-center text-emerald-400 font-bold text-sm">اختر دولة أوروبية:</p>
        </div>
        
        {/* شبكة الدول للهاتف - ✅ بدون عرض رموز البلدان */}
        <div className="grid grid-cols-2 gap-3">
          {worldTopic.countries.map(country => {
            const isOccupied = occupiedCountries.includes(country.id);
            const occupiedByTeam = teamCountries.red.includes(country.id) ? 'red' : 
                                 teamCountries.blue.includes(country.id) ? 'blue' : null;
            const canSelect = currentTurn && !currentQuestion && !currentChoiceQuestion && !isOccupied;

            return (
              <button
                key={country.id}
                onClick={() => canSelect && selectCountry(country)}
                disabled={!canSelect}
                className={`p-3 rounded-lg font-bold text-sm transition-all duration-300 border-2 shadow-md ${
                  isOccupied
                    ? occupiedByTeam === 'red'
                      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-red-400'
                      : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-400'
                    : canSelect
                    ? currentTurn === 'red'
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-red-500 hover:to-red-600 text-white border-gray-400 hover:border-red-400'
                      : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-blue-500 hover:to-blue-600 text-white border-gray-400 hover:border-blue-400'
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400 border-gray-600 cursor-not-allowed opacity-60'
                }`}
              >
                {/* ✅ عرض مبسط بدون رموز البلدان على الهاتف */}
                <div className="flex flex-col items-center gap-2">
                  <span className="font-semibold">
                    {country.name}
                    {isOccupied && (
                      <span className="block text-yellow-300 text-xs mt-1">✓ محتلة</span>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* إحصائيات الفرق المحسّنة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-red-500/20 via-red-600/20 to-pink-500/20 border border-red-400/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🏴</span>
            <h4 className="text-red-400 font-bold text-lg">الفريق الأحمر</h4>
          </div>
          
          <div className="text-center mb-4">
            <div className="bg-red-500/30 rounded-xl p-4 mb-3">
              <p className="text-white font-bold text-2xl mb-1">
                {teamCountries.red.reduce((total, countryId) => {
                  const country = worldTopic.countries.find(c => c.id === countryId);
                  return total + (country ? country.points : 0);
                }, 0)} 
                <span className="text-lg text-red-300"> نقطة</span>
              </p>
              <p className="text-red-300 text-sm">
                {teamCountries.red.length} من {worldTopic.countries.length} دولة أوروبية محتلة
              </p>
            </div>
            
            {/* شريط التقدم للفريق الأحمر */}
            <div className="w-full bg-red-900/30 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(teamCountries.red.length / worldTopic.countries.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="max-h-32 overflow-y-auto">
            {teamCountries.red.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {teamCountries.red.map(countryId => {
                  const country = worldTopic.countries.find(c => c.id === countryId);
                  return country ? (
                    <div key={countryId} className="bg-red-600/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white flex items-center gap-1">
                      <span className="truncate">{country.name}</span>
                      <span className="text-yellow-300 font-bold">+{country.points}</span>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <div className="text-red-300/60 text-center py-4 text-sm italic">
                لم يتم احتلال أي دولة أوروبية بعد
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-indigo-500/20 border border-blue-400/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🏴</span>
            <h4 className="text-blue-400 font-bold text-lg">الفريق الأزرق</h4>
          </div>
          
          <div className="text-center mb-4">
            <div className="bg-blue-500/30 rounded-xl p-4 mb-3">
              <p className="text-white font-bold text-2xl mb-1">
                {teamCountries.blue.reduce((total, countryId) => {
                  const country = worldTopic.countries.find(c => c.id === countryId);
                  return total + (country ? country.points : 0);
                }, 0)}
                <span className="text-lg text-blue-300"> نقطة</span>
              </p>
              <p className="text-blue-300 text-sm">
                {teamCountries.blue.length} من {worldTopic.countries.length} دولة أوروبية محتلة
              </p>
            </div>
            
            {/* شريط التقدم للفريق الأزرق */}
            <div className="w-full bg-blue-900/30 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(teamCountries.blue.length / worldTopic.countries.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="max-h-32 overflow-y-auto">
            {teamCountries.blue.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {teamCountries.blue.map(countryId => {
                  const country = worldTopic.countries.find(c => c.id === countryId);
                  return country ? (
                    <div key={countryId} className="bg-blue-600/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white flex items-center gap-1">
                      <span className="truncate">{country.name}</span>
                      <span className="text-yellow-300 font-bold">+{country.points}</span>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <div className="text-blue-300/60 text-center py-4 text-sm italic">
                لم يتم احتلال أي دولة أوروبية بعد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* مؤشر الدور المحسّن */}
 
    </div>
  );
}