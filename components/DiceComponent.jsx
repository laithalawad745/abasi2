// components/DiceComponent.jsx
import React, { useState, useEffect } from 'react';

export default function DiceComponent({ 
  isRolling, 
  finalValue, 
  onRollComplete, 
  type = 'question', // 'question' or 'points'
  size = 'large' // 'small', 'medium', 'large'
}) {
  const [currentValue, setCurrentValue] = useState(1);
  const [animationStage, setAnimationStage] = useState('idle'); // 'idle', 'rolling', 'slowing', 'stopped'

  // تحديد قيم النرد حسب النوع
  const getValueDisplay = (value) => {
    if (type === 'question') {
      const questionTypes = ['تاريخ', 'جغرافيا', 'رياضة', 'علوم', 'ثقافة', 'تكنولوجيا'];
      const icons = ['🏛️', '🌍', '⚽', '🧬', '📚', '💻'];
      return {
        text: questionTypes[value - 1],
        icon: icons[value - 1]
      };
    } else {
      const pointValues = [100, 150, 200, 250, 300, 350];
      return {
        text: pointValues[value - 1].toString(),
        icon: '💎'
      };
    }
  };

  // تحديد حجم النرد
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-16 h-16 text-xs';
      case 'medium':
        return 'w-20 h-20 text-sm';
      case 'large':
      default:
        return 'w-24 h-24 md:w-32 md:h-32 text-lg md:text-xl';
    }
  };

  // تأثير الرمي - توقيت موحد ودقيق
  useEffect(() => {
    if (isRolling) {
      setAnimationStage('rolling');
      
      // مرحلة الدوران السريع (1.2 ثانية بالضبط)
      const fastRollingInterval = setInterval(() => {
        setCurrentValue(Math.floor(Math.random() * 6) + 1);
      }, 80);

      setTimeout(() => {
        clearInterval(fastRollingInterval);
        setAnimationStage('slowing');
        
        // مرحلة التباطؤ (0.8 ثانية بالضبط)
        const slowRollingInterval = setInterval(() => {
          setCurrentValue(Math.floor(Math.random() * 6) + 1);
        }, 160);

        setTimeout(() => {
          clearInterval(slowRollingInterval);
          setAnimationStage('stopped');
          setCurrentValue(finalValue);
          
          // انتظار قصير جداً قبل الإشارة للانتهاء (0.1 ثانية)
          setTimeout(() => {
            onRollComplete();
          }, 100);
        }, 800);
      }, 1200);
    } else {
      setAnimationStage('idle');
    }
  }, [isRolling, finalValue, onRollComplete]);

  const valueDisplay = getValueDisplay(currentValue);
  const sizeClasses = getSizeClasses();

  return (
    <div className={`relative ${sizeClasses} mx-auto`}>
      {/* النرد */}
      <div className={`
        ${sizeClasses}
        bg-gradient-to-br from-white to-gray-100
        border-4 border-gray-300
        rounded-2xl
        shadow-xl
        flex flex-col items-center justify-center
        transition-all duration-300
        ${animationStage === 'rolling' ? 'animate-bounce' : ''}
        ${animationStage === 'slowing' ? 'animate-pulse' : ''}
        ${animationStage === 'stopped' ? 'scale-110 shadow-2xl' : ''}
        ${isRolling ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}>
        
        {/* النقاط الديكورية (dots) في زوايا النرد */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        
        {/* محتوى النرد */}
        <div className="text-center">
          <div className={`text-2xl md:text-3xl mb-1 ${isRolling ? 'animate-spin' : ''}`}>
            {valueDisplay.icon}
          </div>
          <div className="text-xs md:text-sm font-bold text-gray-700 leading-tight">
            {type === 'question' ? valueDisplay.text : `${valueDisplay.text} نقطة`}
          </div>
        </div>
        
        {/* تأثير الضوء أثناء الدوران */}
        {isRolling && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-2xl animate-pulse"></div>
        )}
      </div>
      
      {/* تأثير الظل المتحرك */}
      <div className={`
        absolute -bottom-2 left-1/2 transform -translate-x-1/2
        w-16 h-4 bg-black/20 rounded-full blur-sm
        transition-all duration-300
        ${animationStage === 'rolling' ? 'animate-pulse scale-110' : ''}
        ${animationStage === 'stopped' ? 'scale-125' : ''}
      `}></div>
      
      {/* نص الحالة */}
      {isRolling && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-bold text-yellow-400 animate-pulse">
            {animationStage === 'rolling' ? 'جاري الرمي...' : 
             animationStage === 'slowing' ? 'توقف...' : 'انتهى!'}
          </span>
        </div>
      )}
    </div>
  );
}