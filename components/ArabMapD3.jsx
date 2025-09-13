// components/ArabMapD3.jsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ArabMapD3({ 
  arabTopic,
  currentTurn,
  occupiedCountries,
  selectCountry,
  teamCountries
}) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState(null);

  const width = 1000;
  const height = 600;

  // ألوان الفرق
  const teamColors = {
    red: '#ff4444',
    blue: '#4444ff'
  };

  // 🌍 الدول العربية المتاحة في اللعبة (أسماء إنجليزية كما تظهر في TopoJSON)
  const arabCountries = [
    'Egypt', 'Libya', 'Algeria', 'Morocco', 'Tunisia', 'Sudan', 'Syria', 'Iraq', 
    'Jordan', 'Lebanon', 'Palestine', 'Saudi Arabia', 'Yemen', 'Oman', 
    'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Mauritania', 
    'Somalia', 'Djibouti', 'Comoros'
  ];

  // 📍 دالة تحويل أسماء الدول من الإنجليزية إلى المعرف المستخدم في اللعبة
  const getCountryId = (countryName) => {
    const countryMapping = {
      'Egypt': 'egypt',
      'Libya': 'libya', 
      'Algeria': 'algeria',
      'Morocco': 'morocco',
      'Tunisia': 'tunisia',
      'Sudan': 'sudan',
      'Syria': 'syria',
      'Iraq': 'iraq',
      'Jordan': 'jordan',
      'Lebanon': 'lebanon',
      'Palestine': 'palestine',
      'Saudi Arabia': 'saudi',
      'Yemen': 'yemen',
      'Oman': 'oman',
      'United Arab Emirates': 'uae',
      'Qatar': 'qatar',
      'Kuwait': 'kuwait',
      'Bahrain': 'bahrain',
      'Mauritania': 'mauritania',
      'Somalia': 'somalia',
      'Djibouti': 'djibouti',
      'Comoros': 'comoros'
    };
    
    return countryMapping[countryName] || countryName.toLowerCase().replace(/\s+/g, '_');
  };

  // 🗺️ دالة للتحقق من كون الدولة عربية ومتاحة في اللعبة
  const isArabCountryAvailable = (countryName) => {
    if (!arabCountries.includes(countryName)) return false;
    if (!arabTopic?.countries) return false;
    
    const countryId = getCountryId(countryName);
    return arabTopic.countries.some(country => country.id === countryId);
  };

  // 📥 تحميل D3 وبيانات الخريطة
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setIsLoading(true);
        
        // تحميل D3 إذا لم يكن محملاً
        if (!window.d3) {
          await loadD3Scripts();
        }

        // تحميل بيانات الخريطة
        const worldData = await window.d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        const countriesData = window.topojson.feature(worldData, worldData.objects.countries);
        
        setMapData(countriesData);
        setIsLoading(false);
      } catch (error) {
        console.error('خطأ في تحميل الخريطة:', error);
        setIsLoading(false);
      }
    };

    loadMapData();
  }, []);

  // 🎨 رسم وتحديث الخريطة
  useEffect(() => {
    if (!mapData || !window.d3) return;
    
    const timer = setTimeout(() => {
      drawMap();
    }, 150);
    
    return () => clearTimeout(timer);
  }, [mapData, occupiedCountries, teamCountries, currentTurn]);

  // 📦 تحميل مكتبات D3
  const loadD3Scripts = () => {
    return new Promise((resolve) => {
      const d3Script = document.createElement('script');
      d3Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
      d3Script.onload = () => {
        const topoScript = document.createElement('script');
        topoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
        topoScript.onload = resolve;
        document.head.appendChild(topoScript);
      };
      document.head.appendChild(d3Script);
    });
  };

  // 🎨 دالة الرسم الرئيسية
  const drawMap = () => {
    const svg = window.d3.select(svgRef.current);
    
    // مسح المحتوى السابق
    svg.selectAll("*").remove();
    
    const g = svg.append("g");
    
    // 🌍 إعداد إسقاط الخريطة (مركز على المنطقة العربية)
    const projection = window.d3.geoMercator()
      .center([45, 25]) // مركز المنطقة العربية
      .scale(400)       // تكبير للمنطقة العربية
      .translate([width / 2, height / 2]);
      
    const path = window.d3.geoPath().projection(projection);
    
    // ⚡ إعداد الزووم
    const zoom = window.d3.zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      
    svg.call(zoom);
    
    // 🗺️ رسم الدول
    g.selectAll(".country")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", d => {
        const countryName = d.properties.NAME || d.properties.name;
        
        // إخفاء الدول غير العربية بجعلها بنفس لون البحر
        if (!isArabCountryAvailable(countryName)) {
          return '#4A9EFF'; // لون البحر
        }
        
        const countryId = getCountryId(countryName);
        
        // تحديد لون الدولة بناءً على الفريق المالك
        if (teamCountries.red.includes(countryId)) {
          return teamColors.red;
        } else if (teamCountries.blue.includes(countryId)) {
          return teamColors.blue;
        }
        
        return '#cccccc'; // دولة متاحة وغير محتلة
      })
      .attr("stroke", d => {
        const countryName = d.properties.NAME || d.properties.name;
        
        if (!isArabCountryAvailable(countryName)) {
          return '#4A9EFF'; // بدون حدود للدول المخفية
        }
        
        return '#2c3e50';
      })
      .attr("stroke-width", d => {
        const countryName = d.properties.NAME || d.properties.name;
        
        if (!isArabCountryAvailable(countryName)) {
          return 0; // بدون حدود للدول المخفية
        }
        
        return 2;
      })
      .style("cursor", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        return isArabCountryAvailable(countryName) && !occupiedCountries.includes(countryId) 
          ? 'pointer' 
          : 'default';
      })
      .on("click", (event, d) => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        if (isArabCountryAvailable(countryName) && !occupiedCountries.includes(countryId)) {
          const country = arabTopic.countries.find(c => c.id === countryId);
          if (country) {
            selectCountry(country);
          }
        }
      })
      .on("mouseover", (event, d) => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        if (isArabCountryAvailable(countryName)) {
          const country = arabTopic.countries.find(c => c.id === countryId);
          if (country) {
            setTooltip({
              show: true,
              x: event.pageX + 10,
              y: event.pageY - 10,
              content: `${country.name} - ${country.points} نقطة`
            });
          }
        }
      })
      .on("mouseout", () => {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      });

    // 🏷️ إضافة أسماء الدول العربية
    const arabCountriesData = mapData.features.filter(d => {
      const countryName = d.properties.NAME || d.properties.name;
      return isArabCountryAvailable(countryName);
    });

    g.selectAll(".country-label")
      .data(arabCountriesData)
      .enter()
      .append("text")
      .attr("class", "country-label")
      .attr("transform", d => {
        const centroid = path.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("stroke", "#2c3e50")
      .style("stroke-width", "1px")
      .style("pointer-events", "none")
      .text(d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = arabTopic.countries.find(c => c.id === countryId);
        return country ? country.name : '';
      });
  };

  // 🔄 عرض شاشة التحميل
  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold shadow-xl backdrop-blur-sm border-2 ${
            currentTurn === 'red' 
              ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-400/50 text-red-300'
              : 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-blue-400/50 text-blue-300'
          }`}>
            <span className="text-2xl">{currentTurn === 'red' ? '🔴' : '🔵'}</span>
            <span className="text-lg">
              دور {currentTurn === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
            </span>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl p-6 min-h-[500px] md:min-h-[600px] flex items-center justify-center border-2 border-amber-600/50 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-amber-400 font-bold text-lg">جاري تحميل خريطة الوطن العربي...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🗺️ عرض الخريطة الرئيسية
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700">
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold shadow-xl backdrop-blur-sm border-2 ${
          currentTurn === 'red' 
            ? 'bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-400/50 text-red-300'
            : 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-blue-400/50 text-blue-300'
        }`}>
          <span className="text-2xl">{currentTurn === 'red' ? '🔴' : '🔵'}</span>
          <span className="text-lg">
            دور {currentTurn === 'red' ? 'الفريق الأحمر' : 'الفريق الأزرق'}
          </span>
        </div>
      </div>

      {/* 🖥️ الخريطة التفاعلية */}
      <div className="relative bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl p-6 min-h-[500px] md:min-h-[600px] overflow-hidden border-2 border-amber-600/50 shadow-2xl">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{ background: '#4A9EFF' }} // لون البحر
        />

        {/* 💡 Tooltip للمعلومات */}
        {tooltip.show && (
          <div
            className="absolute z-50 bg-slate-900/95 text-white px-3 py-2 rounded-lg text-sm font-bold border border-amber-400/50 shadow-xl backdrop-blur-sm"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              pointerEvents: 'none'
            }}
          >
            {tooltip.content}
          </div>
        )}

        {/* 📱 عرض الدول للشاشات الصغيرة */}
        <div className="block md:hidden absolute inset-0 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 p-4">
            {arabTopic?.countries?.map(country => {
              const isOccupied = occupiedCountries.includes(country.id);
              const occupiedByTeam = teamCountries.red.includes(country.id) ? 'red' : 
                                   teamCountries.blue.includes(country.id) ? 'blue' : null;
              
              return (
                <button
                  key={country.id}
                  onClick={() => !isOccupied && selectCountry(country)}
                  disabled={isOccupied}
                  className={`p-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                    isOccupied
                      ? occupiedByTeam === 'red'
                        ? 'bg-red-500/80 border-red-400 text-white cursor-not-allowed'
                        : 'bg-blue-500/80 border-blue-400 text-white cursor-not-allowed'
                      : 'bg-slate-700/50 border-amber-400/50 text-amber-400 hover:bg-slate-600/70 hover:scale-105'
                  }`}
                >
                  <div className="text-lg mb-1">{country.flag}</div>
                  <div className="text-sm">{country.name}</div>
                  <div className="text-xs mt-1">{country.points} نقطة</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}