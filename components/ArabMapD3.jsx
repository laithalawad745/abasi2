
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
  const [missingCountries, setMissingCountries] = useState([]);

  const width = 1000;
  const height = 600;

  // ألوان الفرق
  const teamColors = {
    red: '#ff4444',
    blue: '#4444ff'
  };

  // 🌍 الدول العربية المتاحة في اللعبة (أسماء متعددة محتملة من TopoJSON)
  const arabCountries = [
    'Egypt', 'Libya', 'Algeria', 'Morocco', 'Tunisia', 'Sudan', 'Syria', 'Iraq', 
    'Jordan', 'Lebanon', 'Palestine', 'Saudi Arabia', 'Yemen', 'Oman', 
    'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Mauritania', 
    'Somalia', 'Djibouti', 'Comoros',
    // أسماء بديلة محتملة
    'Syrian Arab Republic', 'Republic of Yemen', 'Hashemite Kingdom of Jordan',
    'State of Kuwait', 'Kingdom of Bahrain', 'State of Qatar', 'Sultanate of Oman',
    'Islamic Republic of Mauritania', 'Federal Republic of Somalia'
  ];

  // 📍 دالة تحويل محسنة من أسماء الدول إلى المعرفات
  const getCountryId = (countryName) => {
    // تعيين شامل يشمل الأسماء الرسمية والمختصرة
    const countryMapping = {
      // الأسماء الأساسية
      'Egypt': 'egypt',
      'Libya': 'libya', 
      'Algeria': 'algeria',
      'Morocco': 'morocco',
      'Tunisia': 'tunisia',
      'Sudan': 'sudan',
      'Syria': 'syria',
      'Syrian Arab Republic': 'syria', // 🔥 اسم سوريا الرسمي
      'Iraq': 'iraq',
      'Jordan': 'jordan',
      'Hashemite Kingdom of Jordan': 'jordan', // 🔥 اسم الأردن الرسمي
      'Lebanon': 'lebanon',
      'Palestine': 'palestine',
      'West Bank and Gaza': 'palestine', // 🔥 اسم فلسطين البديل
      'Palestinian Territory': 'palestine', // 🔥 اسم فلسطين البديل
      'Saudi Arabia': 'saudi',
      'Kingdom of Saudi Arabia': 'saudi', // 🔥 اسم السعودية الرسمي
      'Yemen': 'yemen',
      'Republic of Yemen': 'yemen', // 🔥 اسم اليمن الرسمي
      'Oman': 'oman',
      'Sultanate of Oman': 'oman', // 🔥 اسم عمان الرسمي
      'United Arab Emirates': 'uae',
      'UAE': 'uae',
      'Qatar': 'qatar',
      'State of Qatar': 'qatar', // 🔥 اسم قطر الرسمي
      'Kuwait': 'kuwait',
      'State of Kuwait': 'kuwait', // 🔥 اسم الكويت الرسمي
      'Bahrain': 'bahrain',
      'Kingdom of Bahrain': 'bahrain', // 🔥 اسم البحرين الرسمي
      'Mauritania': 'mauritania',
      'Islamic Republic of Mauritania': 'mauritania', // 🔥 اسم موريتانيا الرسمي
      'Somalia': 'somalia',
      'Federal Republic of Somalia': 'somalia', // 🔥 اسم الصومال الرسمي
      'Djibouti': 'djibouti',
      'Republic of Djibouti': 'djibouti', // 🔥 اسم جيبوتي الرسمي
      'Comoros': 'comoros',
      'Union of the Comoros': 'comoros' // 🔥 اسم جزر القمر الرسمي
    };
    
    return countryMapping[countryName] || countryName.toLowerCase().replace(/\s+/g, '_');
  };

  // 🗺️ دالة للتحقق من كون الدولة عربية ومتاحة في اللعبة
  const isArabCountryAvailable = (countryName) => {
    if (!arabTopic?.countries) return false;
    
    const countryId = getCountryId(countryName);
    const isAvailable = arabTopic.countries.some(country => country.id === countryId);
    
    // تسجيل الدول المفقودة للديباغ
    if (arabCountries.includes(countryName) && !isAvailable) {
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
        if (arabTopic?.countries) {
          console.log('🌍 فحص الدول العربية في TopoJSON...');
          const foundCountries = [];
          const missing = [];
          
          arabTopic.countries.forEach(gameCountry => {
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
  }, [arabTopic]);

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
            console.log(`🎯 تم النقر على: ${countryName} -> ${country.name}`);
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

    // 🔥 إضافة نقاط للدول المفقودة (كحل مؤقت)
    if (missingCountries.length > 0) {
      addMissingCountryPoints(g, projection);
    }
  };

  // 🔧 دالة لإضافة نقاط للدول المفقودة من الخريطة
  const addMissingCountryPoints = (g, projection) => {
    const missingCountryPositions = {
      'البحرين': [50.5577, 26.0667], // إحداثيات البحرين
      'فلسطين': [35.2137, 31.7683], // إحداثيات فلسطين
      'لبنان': [35.8623, 33.8547],   // إحداثيات لبنان
      'جيبوتي': [43.1456, 11.8251],  // إحداثيات جيبوتي
      'جزر القمر': [43.8717, -11.8751] // إحداثيات جزر القمر
    };

    missingCountries.forEach(countryName => {
      const coords = missingCountryPositions[countryName];
      if (coords) {
        const [x, y] = projection(coords);
        const country = arabTopic.countries.find(c => c.name === countryName);
        
        if (country) {
          // إضافة دائرة للدولة المفقودة
          const isOccupied = occupiedCountries.includes(country.id);
          const teamOwner = teamCountries.red.includes(country.id) ? 'red' : 
                           teamCountries.blue.includes(country.id) ? 'blue' : null;
          
          g.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 8)
            .attr("fill", teamOwner ? teamColors[teamOwner] : '#cccccc')
            .attr("stroke", "#2c3e50")
            .attr("stroke-width", 2)
            .style("cursor", isOccupied ? "default" : "pointer")
            .on("click", () => {
              if (!isOccupied) {
                console.log(`🎯 تم النقر على النقطة: ${country.name}`);
                selectCountry(country);
              }
            })
            .on("mouseover", (event) => {
              setTooltip({
                show: true,
                x: event.pageX + 10,
                y: event.pageY - 10,
                content: `${country.name} - ${country.points} نقطة`
              });
            })
            .on("mouseout", () => {
              setTooltip({ show: false, x: 0, y: 0, content: '' });
            });

          // إضافة نص اسم الدولة
          g.append("text")
            .attr("x", x)
            .attr("y", y + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .style("stroke", "#2c3e50")
            .style("stroke-width", "1px")
            .style("pointer-events", "none")
            .text(country.name);
        }
      }
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
        
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-lg text-slate-300">جاري تحميل خريطة الوطن العربي...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-4 md:mb-8 shadow-2xl border border-slate-700">
      {/* عرض دور الفريق الحالي */}
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

      {/* تحذير للدول المفقودة */}
      {missingCountries.length > 0 && (
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3 mb-4 text-center">
          <p className="text-amber-200 text-sm">
            📍 بعض الدول تظهر كنقاط صغيرة: {missingCountries.join(', ')} (لا تشمل البحرين بعد الآن)
          </p>
        </div>
      )}
      
      {/* الخريطة التفاعلية */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto border-2 border-slate-600 rounded-xl bg-gradient-to-b from-sky-400 to-blue-500"
        />
        
        {/* نصائح التنقل */}
   
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-600 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}