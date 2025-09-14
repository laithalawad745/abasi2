// components/EuropeMapD3.jsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function EuropeMapD3({ 
  europeTopic,
  currentTurn,
  occupiedCountries,
  selectCountry,
  teamCountries
}) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [missingCountries, setMissingCountries] = useState([]);

  const width = 1000;
  const height = 600;

  // ألوان الفرق
  const teamColors = {
    red: '#ff4444',
    blue: '#4444ff'
  };

  // 🌍 الدول الأوروبية المتاحة في اللعبة (أسماء متعددة محتملة من TopoJSON)
  const europeCountries = [
    'Norway', 'Sweden', 'Finland', 'Denmark', 'United Kingdom', 'France', 'Germany', 
    'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland', 'Austria',
    'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 
    'Greece', 'Croatia', 'Slovenia', 'Serbia', 'Bosnia and Herzegovina', 'Montenegro',
    'Albania', 'North Macedonia', 'Estonia', 'Latvia', 'Lithuania', 'Belarus',
    'Ukraine', 'Turkey', 'Cyprus', 'Malta', 'Luxembourg', 'Liechtenstein',
    // أسماء بديلة محتملة
    'United Kingdom of Great Britain and Northern Ireland', 'Republic of France',
    'Federal Republic of Germany', 'Italian Republic', 'Kingdom of Spain',
    'Portuguese Republic', 'Kingdom of the Netherlands', 'Kingdom of Belgium',
    'Swiss Confederation', 'Republic of Austria', 'Republic of Poland',
    'Czech Republic', 'Slovak Republic', 'Hungary', 'Romania', 'Republic of Bulgaria'
  ];

  // 📍 دالة تحويل محسنة من أسماء الدول إلى المعرفات
  const getCountryId = (countryName) => {
    // تعيين شامل يشمل الأسماء الرسمية والمختصرة للدول الأوروبية
    const countryMapping = {
      // الأسماء الأساسية
      'Norway': 'norway',
      'Sweden': 'sweden',
      'Finland': 'finland', 
      'Denmark': 'denmark',
      'United Kingdom': 'uk',
      'United Kingdom of Great Britain and Northern Ireland': 'uk',
      'Great Britain': 'uk',
      'Britain': 'uk',
      'France': 'france',
      'Republic of France': 'france',
      'Germany': 'germany',
      'Federal Republic of Germany': 'germany',
      'Italy': 'italy',
      'Italian Republic': 'italy',
      'Spain': 'spain',
      'Kingdom of Spain': 'spain',
      'Portugal': 'portugal',
      'Portuguese Republic': 'portugal',
      'Netherlands': 'netherlands',
      'Kingdom of the Netherlands': 'netherlands',
      'Holland': 'netherlands',
      'Belgium': 'belgium',
      'Kingdom of Belgium': 'belgium',
      'Switzerland': 'switzerland',
      'Swiss Confederation': 'switzerland',
      'Austria': 'austria',
      'Republic of Austria': 'austria',
      'Poland': 'poland',
      'Republic of Poland': 'poland',
      'Czech Republic': 'czech_republic',
      'Czechia': 'czech_republic',
      'Slovakia': 'slovakia',
      'Slovak Republic': 'slovakia',
      'Hungary': 'hungary',
      'Romania': 'romania',
      'Bulgaria': 'bulgaria',
      'Republic of Bulgaria': 'bulgaria',
      'Greece': 'greece',
      'Hellenic Republic': 'greece',
      'Croatia': 'croatia',
      'Republic of Croatia': 'croatia',
      'Slovenia': 'slovenia',
      'Republic of Slovenia': 'slovenia',
      'Serbia': 'serbia',
      'Republic of Serbia': 'serbia',
      'Bosnia and Herzegovina': 'bosnia_herzegovina',
      'Montenegro': 'montenegro',
      'Albania': 'albania',
      'Republic of Albania': 'albania',
      'North Macedonia': 'north_macedonia',
      'Macedonia': 'north_macedonia',
      'Estonia': 'estonia',
      'Republic of Estonia': 'estonia',
      'Latvia': 'latvia',
      'Republic of Latvia': 'latvia',
      'Lithuania': 'lithuania',
      'Republic of Lithuania': 'lithuania',
      'Belarus': 'belarus',
      'Republic of Belarus': 'belarus',
      'Ukraine': 'ukraine',
      'Turkey': 'turkey',
      'Republic of Turkey': 'turkey',
      'Cyprus': 'cyprus',
      'Republic of Cyprus': 'cyprus',
      'Malta': 'malta',
      'Republic of Malta': 'malta',
      'Luxembourg': 'luxembourg',
      'Grand Duchy of Luxembourg': 'luxembourg',
      'Liechtenstein': 'liechtenstein',
      'Principality of Liechtenstein': 'liechtenstein'
    };
    
    return countryMapping[countryName] || countryName.toLowerCase().replace(/\s+/g, '_');
  };

  // 🗺️ دالة للتحقق من كون الدولة أوروبية ومتاحة في اللعبة
  const isEuropeCountryAvailable = (countryName) => {
    if (!europeTopic?.countries) return false;
    
    const countryId = getCountryId(countryName);
    const isAvailable = europeTopic.countries.some(country => country.id === countryId);
    
    // تسجيل الدول المفقودة للديباغ
    if (europeCountries.includes(countryName) && !isAvailable) {
      console.log(`🔍 دولة مفقودة: ${countryName} -> ${countryId}`);
    }
    
    return isAvailable;
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
        
        // فحص الدول المتاحة في TopoJSON
        if (europeTopic?.countries) {
          console.log('🌍 فحص الدول الأوروبية في TopoJSON...');
          const foundCountries = [];
          const missing = [];
          
          europeTopic.countries.forEach(gameCountry => {
            const found = countriesData.features.some(mapCountry => {
              const countryName = mapCountry.properties.NAME || mapCountry.properties.name;
              const countryId = getCountryId(countryName);
              return countryId === gameCountry.id;
            });
            
            if (found) {
              foundCountries.push(gameCountry.name);
            } else {
              missing.push(gameCountry.name);
            }
          });
          
          console.log('✅ دول موجودة على الخريطة:', foundCountries);
          console.log('❌ دول مفقودة من الخريطة:', missing);
          setMissingCountries(missing);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('خطأ في تحميل الخريطة:', error);
        setIsLoading(false);
      }
    };

    loadMapData();
  }, [europeTopic]);

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
    
    // 🌍 إعداد إسقاط الخريطة (مركز على أوروبا)
    const projection = window.d3.geoMercator()
      .center([20, 54]) // مركز أوروبا
      .scale(450)       // تكبير للمنطقة الأوروبية
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
        
        // إخفاء الدول غير الأوروبية بجعلها بنفس لون البحر
        if (!isEuropeCountryAvailable(countryName)) {
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
        
        if (!isEuropeCountryAvailable(countryName)) {
          return '#4A9EFF'; // بدون حدود للدول المخفية
        }
        
        return '#2c3e50';
      })
      .attr("stroke-width", d => {
        const countryName = d.properties.NAME || d.properties.name;
        
        if (!isEuropeCountryAvailable(countryName)) {
          return 0; // بدون حدود للدول المخفية
        }
        
        return 2;
      })
      .style("cursor", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        return isEuropeCountryAvailable(countryName) && !occupiedCountries.includes(countryId) 
          ? 'pointer' 
          : 'default';
      })
      .on("click", (event, d) => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        if (isEuropeCountryAvailable(countryName) && !occupiedCountries.includes(countryId)) {
          const country = europeTopic.countries.find(c => c.id === countryId);
          if (country) {
            console.log(`🎯 تم النقر على: ${countryName} -> ${country.name}`);
            selectCountry(country);
          }
        }
      })
 
      .on("mouseout", () => {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      });

    // 🏷️ إضافة أسماء الدول الأوروبية
    const europeCountriesData = mapData.features.filter(d => {
      const countryName = d.properties.NAME || d.properties.name;
      return isEuropeCountryAvailable(countryName);
    });

    g.selectAll(".country-label")
      .data(europeCountriesData)
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
        const country = europeTopic.countries.find(c => c.id === countryId);
        return country ? country.name.substring(0, 8) : '';
      });
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">تحميل خريطة أوروبا التفاعلية...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700">
      <div className="text-center mb-6">
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
          </div>
        </div>
      </div>

      {/* الخريطة التفاعلية */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-600/50 shadow-2xl">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full border-2 border-slate-600 rounded-xl bg-gradient-to-b from-sky-400 to-blue-500"
          style={{ backgroundColor: '#4A9EFF' }}
        >
        </svg>
      </div>

      {/* عرض الدول المفقودة للديباغ */}
      {missingCountries.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>تحذير:</strong> بعض الدول غير موجودة على الخريطة: {missingCountries.join(', ')}
          </p>
        </div>
      )}

      {/* الـ Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-600 pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}