// components/FindCountryWorldMap.jsx - إصلاح مشكلة إعادة التحميل والزوم
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getCountryNameAR } from '../app/data/findCountryConfig';

export default function FindCountryWorldMap({ countries, onCountryClick, currentPlayer, actionType }) {
  const svgRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // ✅ مرجع للخريطة المرسومة لتجنب إعادة الرسم
  const mapDrawnRef = useRef(false);
  const lastCountriesRef = useRef({});

  const width = 1000;
  const height = 600;

  // ألوان خاصة للعبة أوجد الدولة
  const getCountryColor = (countryId, country) => {
    if (!country) return '#cccccc'; // دولة فارغة
    
    if (country.owner === -1) return '#22c55e'; // أخضر للإجابة الصحيحة
    if (country.owner === -2) return '#ef4444'; // أحمر للإجابة الخاطئة
    
    return '#cccccc'; // لون افتراضي
  };

  // قائمة الدول المتاحة
  const availableCountries = [
    'egypt', 'libya', 'algeria', 'france', 'germany', 'spain', 'italy', 
    'united_kingdom', 'poland', 'ukraine', 'turkey', 'iran', 'saudi_arabia',
    'pakistan', 'india', 'china', 'mongolia', 'russia', 'kazakhstan',
    'thailand', 'vietnam', 'indonesia', 'australia', 'brazil', 'argentina',
    'usa', 'canada', 'mexico', 'south_africa', 'nigeria', 'japan', 'south_korea',
    'chad', 'gabon', 'south_sudan', 'central_african_republic', 
    'democratic_republic_congo', 'congo', 'belarus', 'czech_republic', 
    'somalia', 'ivory_coast', 'ghana', 'norway', 'sweden', 'finland', 
    'denmark', 'netherlands', 'belgium', 'switzerland', 'austria', 'romania', 
    'bulgaria', 'greece', 'portugal', 'myanmar', 'malaysia', 'philippines', 
    'north_korea', 'afghanistan', 'uzbekistan', 'bangladesh', 'sri_lanka', 
    'nepal', 'bhutan', 'laos', 'cambodia', 'morocco', 'tunisia', 'sudan', 
    'ethiopia', 'kenya', 'tanzania', 'zambia', 'zimbabwe', 'botswana', 
    'namibia', 'madagascar', 'cameroon', 'angola', 'chile', 'peru', 
    'colombia', 'venezuela', 'bolivia', 'ecuador', 'uruguay', 'guatemala', 
    'cuba', 'panama', 'costa_rica', 'nicaragua', 'new_zealand', 
    'papua_new_guinea', 'fiji', 'syria', 'jordan', 'iraq', 'yemen', 
    'oman', 'uae', 'kuwait', 'qatar', 'tajikistan', 'turkmenistan', 
    'armenia', 'georgia', 'kyrgyzstan', 'azerbaijan', 'estonia', 'latvia', 
    'lithuania', 'slovakia', 'slovenia', 'hungary', 'croatia', 
    'bosnia_herzegovina', 'serbia', 'montenegro', 'albania', 'ireland', 
    'iceland', 'eritrea', 'uganda', 'niger', 'mali', 'mauritania', 
    'western_sahara', 'benin', 'togo', 'burkina_faso', 'liberia', 
    'guinea', 'sierra_leone', 'guinea_bissau', 'senegal', 'malawi', 
    'mozambique', 'greenland', 'paraguay', 'suriname', 'guyana', 'honduras'
  ];

  const isCountryAvailable = (countryId) => {
    return availableCountries.includes(countryId);
  };

  const getCountryId = (countryName) => {
    const countryMapping = {
      'Egypt': 'egypt',
      'Libya': 'libya', 
      'Algeria': 'algeria',
      'France': 'france',
      'Germany': 'germany',
      'Spain': 'spain',
      'Italy': 'italy',
      'United Kingdom': 'united_kingdom',
      'Poland': 'poland',
      'Ukraine': 'ukraine',
      'Turkey': 'turkey',
      'Iran': 'iran',
      'Saudi Arabia': 'saudi_arabia',
      'Pakistan': 'pakistan',
      'India': 'india',
      'China': 'china',
      'Mongolia': 'mongolia',
      'Russia': 'russia',
      'Kazakhstan': 'kazakhstan',
      'Thailand': 'thailand',
      'Vietnam': 'vietnam',
      'Indonesia': 'indonesia',
      'Australia': 'australia',
      'Brazil': 'brazil',
      'Argentina': 'argentina',
      'United States of America': 'usa',
      'Canada': 'canada',
      'Mexico': 'mexico',
      'South Africa': 'south_africa',
      'Nigeria': 'nigeria',
      'Japan': 'japan',
      'South Korea': 'south_korea',
      'Chad': 'chad',
      'Gabon': 'gabon',
      'South Sudan': 'south_sudan',
      'Central African Republic': 'central_african_republic',
      'Democratic Republic of the Congo': 'democratic_republic_congo',
      'Republic of the Congo': 'congo',
      'Belarus': 'belarus',
      'Czech Republic': 'czech_republic',
      'Somalia': 'somalia',
      'Ivory Coast': 'ivory_coast',
      'Ghana': 'ghana',
      'Norway': 'norway',
      'Sweden': 'sweden',
      'Finland': 'finland',
      'Denmark': 'denmark',
      'Netherlands': 'netherlands',
      'Belgium': 'belgium',
      'Switzerland': 'switzerland',
      'Austria': 'austria',
      'Romania': 'romania',
      'Bulgaria': 'bulgaria',
      'Greece': 'greece',
      'Portugal': 'portugal',
      'Myanmar': 'myanmar',
      'Malaysia': 'malaysia',
      'Philippines': 'philippines',
      'North Korea': 'north_korea',
      'Afghanistan': 'afghanistan',
      'Uzbekistan': 'uzbekistan',
      'Bangladesh': 'bangladesh',
      'Sri Lanka': 'sri_lanka',
      'Nepal': 'nepal',
      'Bhutan': 'bhutan',
      'Laos': 'laos',
      'Cambodia': 'cambodia',
      'Morocco': 'morocco',
      'Tunisia': 'tunisia',
      'Sudan': 'sudan',
      'Ethiopia': 'ethiopia',
      'Kenya': 'kenya',
      'Tanzania': 'tanzania',
      'Zambia': 'zambia',
      'Zimbabwe': 'zimbabwe',
      'Botswana': 'botswana',
      'Namibia': 'namibia',
      'Madagascar': 'madagascar',
      'Cameroon': 'cameroon',
      'Angola': 'angola',
      'Chile': 'chile',
      'Peru': 'peru',
      'Colombia': 'colombia',
      'Venezuela': 'venezuela',
      'Bolivia': 'bolivia',
      'Ecuador': 'ecuador',
      'Uruguay': 'uruguay',
      'Guatemala': 'guatemala',
      'Cuba': 'cuba',
      'Panama': 'panama',
      'Costa Rica': 'costa_rica',
      'Nicaragua': 'nicaragua',
      'New Zealand': 'new_zealand',
      'Papua New Guinea': 'papua_new_guinea',
      'Fiji': 'fiji',
      'Israel': 'israel',
      'Lebanon': 'lebanon',
      'Syria': 'syria',
      'Jordan': 'jordan',
      'Iraq': 'iraq',
      'Yemen': 'yemen',
      'Oman': 'oman',
      'United Arab Emirates': 'uae',
      'Kuwait': 'kuwait',
      'Qatar': 'qatar',
      'Tajikistan': 'tajikistan',
      'Turkmenistan': 'turkmenistan',
      'Armenia': 'armenia',
      'Georgia': 'georgia',
      'Kyrgyzstan': 'kyrgyzstan',
      'Azerbaijan': 'azerbaijan',
      'Estonia': 'estonia',
      'Latvia': 'latvia',
      'Lithuania': 'lithuania',
      'Slovakia': 'slovakia',
      'Slovenia': 'slovenia',
      'Hungary': 'hungary',
      'Croatia': 'croatia',
      'Bosnia and Herzegovina': 'bosnia_herzegovina',
      'Serbia': 'serbia',
      'Montenegro': 'montenegro',
      'Albania': 'albania',
      'Ireland': 'ireland',
      'Iceland': 'iceland',
      'Eritrea': 'eritrea',
      'Uganda': 'uganda',
      'Niger': 'niger',
      'Mali': 'mali',
      'Mauritania': 'mauritania',
      'Western Sahara': 'western_sahara',
      'Benin': 'benin',
      'Togo': 'togo',
      'Burkina Faso': 'burkina_faso',
      'Liberia': 'liberia',
      'Guinea': 'guinea',
      'Sierra Leone': 'sierra_leone',
      'Guinea-Bissau': 'guinea_bissau',
      'Senegal': 'senegal',
      'Malawi': 'malawi',
      'Mozambique': 'mozambique',
      'Greenland': 'greenland',
      'Paraguay': 'paraguay',
      'Suriname': 'suriname',
      'Guyana': 'guyana',
      'Honduras': 'honduras'
    };
    
    return countryMapping[countryName] || countryName.toLowerCase().replace(/\s+/g, '_');
  };

  // ✅ تحميل D3 وبيانات الخريطة مرة واحدة فقط
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
  }, []); // فقط عند التحميل الأول

  // ✅ رسم الخريطة مرة واحدة فقط عند تحميل البيانات
  useEffect(() => {
    if (!mapData || !window.d3 || mapDrawnRef.current) return;
    
    drawMap();
    mapDrawnRef.current = true;
    setMapInitialized(true);
  }, [mapData]); // فقط عند تحميل البيانات

  // ✅ تحديث ألوان الدول فقط (بدون إعادة رسم كامل) - مع تحسين الأداء
  useEffect(() => {
    if (!mapInitialized || !window.d3) return;
    
    // ✅ التحقق من التغيير الفعلي في countries قبل التحديث
    const currentCountriesStr = JSON.stringify(countries);
    const lastCountriesStr = JSON.stringify(lastCountriesRef.current);
    
    if (currentCountriesStr === lastCountriesStr) {
      return; // لا يوجد تغيير فعلي
    }
    
    lastCountriesRef.current = { ...countries };
    
    // ✅ تحديث الألوان فقط بدون إعادة رسم
    updateCountryColors();
  }, [countries, mapInitialized]);

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

  // ✅ دالة الرسم الأولي (مرة واحدة فقط)
  const drawMap = useCallback(() => {
    const svg = window.d3.select(svgRef.current);
    
    // مسح المحتوى السابق
    svg.selectAll("*").remove();
    
    const g = svg.append("g");
    
    const projection = window.d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);
      
    const path = window.d3.geoPath().projection(projection);
    
    // إعداد الزووم
    const zoom = window.d3.zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      
    svg.call(zoom);
    
    // رسم الدول
    g.selectAll(".country")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        
        // إخفاء الدول غير المتاحة
        if (!isCountryAvailable(countryId)) {
          return '#3b82f6'; // لون البحر
        }
        
        return getCountryColor(countryId, country);
      })
      .attr("stroke", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        if (!isCountryAvailable(countryId)) {
          return '#3b82f6'; // نفس لون البحر
        }
        
        return '#2c3e50';
      })
      .attr("stroke-width", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        if (!isCountryAvailable(countryId)) {
          return 0.5;
        }
        
        return 1.5;
      })
      .style("cursor", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        return isCountryAvailable(countryId) ? "pointer" : "default";
      })
      .on("click", (event, d) => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        if (isCountryAvailable(countryId) && onCountryClick) {
          onCountryClick(countryId);
        }
      });
  }, [mapData, countries, onCountryClick]); // dependencies محدودة بحذر

  // ✅ دالة تحديث الألوان فقط (محسنة للأداء)
  const updateCountryColors = useCallback(() => {
    const svg = window.d3.select(svgRef.current);
    
    svg.selectAll(".country")
      .attr("fill", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        
        // إخفاء الدول غير المتاحة
        if (!isCountryAvailable(countryId)) {
          return '#3b82f6'; // لون البحر
        }
        
        return getCountryColor(countryId, country);
      });
  }, [countries]);

  // خريطة احتياطية في حالة فشل تحميل D3
  const renderFallbackMap = () => {
    const continents = [
      { id: 'asia', name: 'آسيا', x: 750, y: 200 },
      { id: 'europe', name: 'أوروبا', x: 500, y: 150 },
      { id: 'africa', name: 'أفريقيا', x: 500, y: 350 },
      { id: 'north_america', name: 'أمريكا الشمالية', x: 200, y: 200 },
      { id: 'south_america', name: 'أمريكا الجنوبية', x: 250, y: 450 },
      { id: 'oceania', name: 'أوقيانوسيا', x: 850, y: 450 }
    ];

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto bg-[#3b82f6] rounded-lg"
      >
        {continents.map(continent => {
          const country = countries[continent.id];
          const color = getCountryColor(continent.id, country);
          
          return (
            <g key={continent.id}>
              <circle
                cx={continent.x}
                cy={continent.y}
                r={40}
                fill={color}
                stroke="#2c3e50"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (onCountryClick) {
                    onCountryClick(continent.id);
                  }
                }}
              />
              <text
                x={continent.x}
                y={continent.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fill: '#2c3e50',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  stroke: 'white',
                  strokeWidth: '2px',
                  paintOrder: 'stroke'
                }}
              >
                {continent.name}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white text-xl">⏳ جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {mapData ? (
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
className="w-full h-[400px] md:h-auto bg-[#3b82f6] rounded-lg"
        />
      ) : (
        renderFallbackMap()
      )}
      
      {/* تعليمات */}
      {/* <div className="mt-4 text-center">
        <p className="text-gray-400">
          🌍 اضغط على الدولة الصحيحة في الخريطة
        </p>
      </div> */}
    </div>
  );
}