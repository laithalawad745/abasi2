// components/RiskGame/WorldMap.jsx
import React from 'react';

export default function WorldMap({ countries, onCountryClick, currentPlayer, attackMode }) {
  // خريطة العالم المبسطة بـ SVG
  const worldCountries = {
    egypt: { x: 520, y: 280, width: 60, height: 50 },
    libya: { x: 460, y: 260, width: 50, height: 60 },
    france: { x: 440, y: 180, width: 40, height: 50 },
    germany: { x: 480, y: 160, width: 40, height: 40 },
    brazil: { x: 280, y: 380, width: 80, height: 70 },
    usa: { x: 200, y: 200, width: 120, height: 80 },
    china: { x: 700, y: 220, width: 90, height: 60 },
    russia: { x: 600, y: 120, width: 150, height: 80 },
    australia: { x: 750, y: 420, width: 70, height: 50 },
    india: { x: 640, y: 280, width: 60, height: 60 }
  };

  // العثور على اللاعب المالك للدولة
  const findPlayerById = (playerId) => {
    // هذا يجب أن يأتي من props أو context
    // لكن سنستخدم الألوان الافتراضية الآن
    const playerColors = [
      '#ff4444', '#4444ff', '#44ff44', '#ffff44',
      '#ff44ff', '#44ffff', '#ff8844', '#8844ff'
    ];
    return {
      id: playerId,
      color: playerColors[playerId] || '#666666'
    };
  };

  const getCountryColor = (countryId) => {
    const country = countries[countryId];
    if (!country?.owner && country?.owner !== 0) return '#8B7355'; // بني للدول غير المحتلة
    
    const ownerPlayer = findPlayerById(country.owner);
    return ownerPlayer ? ownerPlayer.color : '#8B7355';
  };

  const getCountryOpacity = (countryId) => {
    const country = countries[countryId];
    if (!country?.owner && country?.owner !== 0) return 0.7;
    return country.owner === currentPlayer?.id ? 1 : 0.5;
  };

  const getCountryName = (countryId) => {
    const names = {
      egypt: 'مصر',
      libya: 'ليبيا', 
      france: 'فرنسا',
      germany: 'ألمانيا',
      brazil: 'البرازيل',
      usa: 'أمريكا',
      china: 'الصين',
      russia: 'روسيا',
      australia: 'أستراليا',
      india: 'الهند'
    };
    return names[countryId] || countryId;
  };

  const getCountryBorderColor = (countryId) => {
    const country = countries[countryId];
    if (country?.owner === currentPlayer?.id) {
      return '#FFD700'; // ذهبي للدول المملوكة
    } else if (country?.owner !== undefined && country?.owner !== null) {
      return '#FF4444'; // أحمر للدول المحتلة من قبل لاعبين آخرين
    }
    return '#2D1810'; // بني داكن للدول غير المحتلة
  };

  const getCountryBorderWidth = (countryId) => {
    const country = countries[countryId];
    if (country?.owner === currentPlayer?.id) {
      return '3'; // حدود أكثر سماكة للدول المملوكة
    }
    return '2';
  };

  // تأثير hover للدول
  const getCountryHoverEffect = (countryId) => {
    const country = countries[countryId];
    const baseClass = "cursor-pointer transition-all duration-300";
    
    if (!country?.owner && country?.owner !== 0) {
      // دولة غير محتلة - يمكن احتلالها
      return `${baseClass} hover:brightness-125 hover:scale-105 hover:stroke-yellow-400`;
    } else if (country?.owner === currentPlayer?.id) {
      // دولة مملوكة - يمكن تقويتها
      return `${baseClass} hover:brightness-110 hover:scale-102 hover:stroke-green-400`;
    } else {
      // دولة مملوكة من لاعب آخر - يمكن مهاجمتها
      return `${baseClass} hover:brightness-90 hover:scale-102 hover:stroke-red-400`;
    }
  };

  return (
    <div className="fixed inset-0 pt-20 pb-4 overflow-hidden">
      <div className="w-full h-full relative bg-gradient-to-br from-blue-500 to-blue-700">
        <svg viewBox="0 0 1000 600" className="w-full h-full">
          {/* خلفية المحيط */}
          <rect width="1000" height="600" fill="url(#oceanGradient)" />
          
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            
            {/* تأثيرات الظل */}
            <filter id="countryShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
            
            {/* تأثير الإضاءة */}
            <filter id="countryGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* رسم الدول */}
          {Object.entries(worldCountries).map(([countryId, coords]) => {
            const country = countries[countryId] || {};
            const isOwned = country.owner !== undefined && country.owner !== null;
            const isCurrentPlayerOwned = country.owner === currentPlayer?.id;
            
            return (
              <g key={countryId}>
                {/* شكل الدولة */}
                <rect
                  x={coords.x}
                  y={coords.y}
                  width={coords.width}
                  height={coords.height}
                  fill={getCountryColor(countryId)}
                  opacity={getCountryOpacity(countryId)}
                  stroke={getCountryBorderColor(countryId)}
                  strokeWidth={getCountryBorderWidth(countryId)}
                  rx="5"
                  filter={isCurrentPlayerOwned ? "url(#countryGlow)" : "url(#countryShadow)"}
                  className={getCountryHoverEffect(countryId)}
                  onClick={() => onCountryClick(countryId)}
                />
                
                {/* تأثير النبض للدولة النشطة */}
                {isCurrentPlayerOwned && (
                  <rect
                    x={coords.x - 2}
                    y={coords.y - 2}
                    width={coords.width + 4}
                    height={coords.height + 4}
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="2"
                    rx="7"
                    opacity="0.7"
                    className="animate-pulse"
                  />
                )}
                
                {/* عدد الجنود */}
                {country.troops > 0 && (
                  <>
                    <circle
                      cx={coords.x + coords.width/2}
                      cy={coords.y + coords.height/2}
                      r="18"
                      fill="#000000"
                      opacity="0.8"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={coords.x + coords.width/2}
                      y={coords.y + coords.height/2 + 6}
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {country.troops}
                    </text>
                  </>
                )}
                
                {/* اسم الدولة */}
                <text
                  x={coords.x + coords.width/2}
                  y={coords.y - 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                  filter="url(#countryShadow)"
                >
                  {getCountryName(countryId)}
                </text>

                {/* أيقونة التاج للدول المملوكة */}
                {isOwned && (
                  <text
                    x={coords.x + coords.width - 8}
                    y={coords.y + 15}
                    textAnchor="middle"
                    fontSize="12"
                    className="pointer-events-none select-none"
                  >
                    👑
                  </text>
                )}

                {/* أيقونة السيوف في وضع الهجوم */}
                {attackMode && country.owner !== currentPlayer?.id && isOwned && (
                  <text
                    x={coords.x + 8}
                    y={coords.y + 15}
                    textAnchor="middle"
                    fontSize="12"
                    className="pointer-events-none select-none animate-bounce"
                  >
                    ⚔️
                  </text>
                )}
              </g>
            );
          })}

          {/* خطوط الاتصال بين القارات (اختياري) */}
          <g stroke="#ffffff" strokeWidth="1" opacity="0.3" strokeDasharray="5,5">
            {/* خط بين أوروبا وأفريقيا */}
            <line x1="440" y1="230" x2="520" y2="280" />
            {/* خط بين آسيا وأوروبا */}
            <line x1="520" y1="160" x2="600" y2="180" />
            {/* خط بين آسيا وأستراليا */}
            <line x1="750" y1="280" x2="750" y2="420" />
          </g>
        </svg>
        
        {/* لوحة المعلومات */}
        <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-lg rounded-lg p-4 min-w-64">
          <h3 className="text-white font-bold mb-3">معلومات اللعبة:</h3>
          
          {/* مفتاح الألوان */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-4 h-4 bg-yellow-600 rounded border border-white"></div>
              <span>دول غير محتلة</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-4 h-4 rounded border-2 border-yellow-400" style={{ backgroundColor: currentPlayer?.color || '#666' }}></div>
              <span>دولك الحالية</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-4 h-4 bg-gray-600 rounded border border-white"></div>
              <span>دول اللاعبين الآخرين</span>
            </div>
          </div>

          {/* تعليمات سريعة */}
          <div className="mt-4 pt-3 border-t border-slate-600">
            <h4 className="text-white font-bold text-sm mb-2">التعليمات:</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• اضغط على دولة فارغة لاحتلالها</div>
              <div>• اضغط على دولتك لتقويتها</div>
              <div>• اضغط على دولة مجاورة لمهاجمتها</div>
            </div>
          </div>
        </div>

        {/* مؤشر الدور الحالي */}
        {currentPlayer && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-lg rounded-lg px-6 py-3 border-2" style={{ borderColor: currentPlayer.color }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: currentPlayer.color }}
              ></div>
              <span className="text-white font-bold">{currentPlayer.name}</span>
              <span className="text-gray-300">- اختر دولة</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}