// components/RiskGame/WorldMapD3.jsx - إضافة الدول الجديدة فقط
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function WorldMapD3({ countries, onCountryClick, currentPlayer, actionType }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState(null);

  const width = 1000;
  const height = 600;

  // ألوان اللاعبين (ثابتة ومرتبة)
  const playerColors = [
    '#ff4444', // أحمر - لاعب 0
    '#4444ff', // أزرق - لاعب 1  
    '#44ff44', // أخضر - لاعب 2
    '#ffff44', // أصفر - لاعب 3
    '#ff44ff', // بنفسجي - لاعب 4
    '#44ffff', // سماوي - لاعب 5
    '#ff8844', // برتقالي - لاعب 6
    '#8844ff'  // بنفسجي غامق - لاعب 7
  ];

  // 🆕 قائمة الدول المتاحة في اللعبة - مع الدول الجديدة المضافة
  const availableCountries = [
    // الدول الأصلية
    'egypt', 'libya', 'algeria', 'france', 'germany', 'spain', 'italy', 
    'united_kingdom', 'poland', 'ukraine', 'turkey', 'iran', 'saudi_arabia',
    'pakistan', 'india', 'china', 'mongolia', 'russia', 'kazakhstan',
    'thailand', 'vietnam', 'indonesia', 'australia', 'brazil', 'argentina',
    'usa', 'canada', 'mexico', 'south_africa', 'nigeria', 'japan', 'south_korea',
    
    // 🆕 الدول الجديدة المضافة
    // أوروبا
    'norway', 'sweden', 'finland', 'denmark', 'netherlands', 'belgium', 'switzerland',
    'austria', 'czech_republic', 'romania', 'bulgaria', 'greece', 'portugal',
    
    // آسيا
    'myanmar', 'malaysia', 'philippines', 'north_korea', 'afghanistan', 'uzbekistan',
    'bangladesh', 'sri_lanka', 'nepal', 'bhutan', 'laos', 'cambodia',
    
    // أفريقيا
    'morocco', 'tunisia', 'sudan', 'ethiopia', 'kenya', 'tanzania', 'zambia',
    'zimbabwe', 'botswana', 'namibia', 'madagascar', 'ghana', 'ivory_coast',
    'cameroon', 'democratic_republic_congo', 'angola',
    
    // الأمريكتين
    'chile', 'peru', 'colombia', 'venezuela', 'bolivia', 'ecuador', 'uruguay',
    'guatemala', 'cuba', 'panama', 'costa_rica', 'nicaragua',
    
    // أوقيانوسيا
    'new_zealand', 'papua_new_guinea', 'fiji',
    
    // الشرق الأوسط
    'israel', 'lebanon', 'syria', 'jordan', 'iraq', 'yemen', 'oman', 'uae', 'kuwait', 'qatar'
  ];

  // دالة للتحقق من توفر الدولة
  const isCountryAvailable = (countryId) => {
    return availableCountries.includes(countryId);
  };

  // أرقام المناطق
  const regionNumbers = {
    'United States of America': '1', 'Canada': '3', 'Mexico': '1', 'Brazil': '1',
    'Argentina': '1', 'Russia': '2', 'China': '12', 'India': '17', 'Australia': '10',
    'Germany': '13', 'France': '1', 'United Kingdom': '1', 'Egypt': '1', 'Nigeria': '13',
    'South Africa': '1', 'Japan': '1', 'Mongolia': '9', 'Kazakhstan': '1', 'Turkey': '1',
    'Iran': '1', 'Saudi Arabia': '1', 'Poland': '1', 'Ukraine': '1', 'Spain': '1',
    'Italy': '1', 'Indonesia': '1', 'Thailand': '1', 'Vietnam': '1', 'Pakistan': '1'
  };

  const getCountryId = (countryName) => {
    const countryMapping = {
      'Egypt': 'egypt', 'Libya': 'libya', 'Algeria': 'algeria', 'France': 'france',
      'Germany': 'germany', 'Brazil': 'brazil', 'United States of America': 'usa',
      'China': 'china', 'Russia': 'russia', 'Australia': 'australia', 'India': 'india',
      'United Kingdom': 'united_kingdom', 'Spain': 'spain', 'Italy': 'italy',
      'Canada': 'canada', 'Mexico': 'mexico', 'Argentina': 'argentina',
      'South Africa': 'south_africa', 'Nigeria': 'nigeria', 'Japan': 'japan',
      'South Korea': 'south_korea', 'Indonesia': 'indonesia', 'Turkey': 'turkey',
      'Iran': 'iran', 'Saudi Arabia': 'saudi_arabia', 'Pakistan': 'pakistan',
      'Poland': 'poland', 'Ukraine': 'ukraine', 'Kazakhstan': 'kazakhstan',
      'Mongolia': 'mongolia', 'Thailand': 'thailand', 'Vietnam': 'vietnam',
      
      // 🆕 ربط الدول الجديدة
      'Norway': 'norway', 'Sweden': 'sweden', 'Finland': 'finland', 'Denmark': 'denmark',
      'Netherlands': 'netherlands', 'Belgium': 'belgium', 'Switzerland': 'switzerland',
      'Austria': 'austria', 'Czech Republic': 'czech_republic', 'Romania': 'romania',
      'Bulgaria': 'bulgaria', 'Greece': 'greece', 'Portugal': 'portugal',
      'Myanmar': 'myanmar', 'Malaysia': 'malaysia', 'Philippines': 'philippines',
      'North Korea': 'north_korea', 'Afghanistan': 'afghanistan', 'Uzbekistan': 'uzbekistan',
      'Bangladesh': 'bangladesh', 'Sri Lanka': 'sri_lanka', 'Nepal': 'nepal',
      'Bhutan': 'bhutan', 'Laos': 'laos', 'Cambodia': 'cambodia',
      'Morocco': 'morocco', 'Tunisia': 'tunisia', 'Sudan': 'sudan', 'Ethiopia': 'ethiopia',
      'Kenya': 'kenya', 'Tanzania': 'tanzania', 'Zambia': 'zambia', 'Zimbabwe': 'zimbabwe',
      'Botswana': 'botswana', 'Namibia': 'namibia', 'Madagascar': 'madagascar',
      'Ghana': 'ghana', 'Ivory Coast': 'ivory_coast', 'Cameroon': 'cameroon',
      'Democratic Republic of the Congo': 'democratic_republic_congo', 'Angola': 'angola',
      'Chile': 'chile', 'Peru': 'peru', 'Colombia': 'colombia', 'Venezuela': 'venezuela',
      'Bolivia': 'bolivia', 'Ecuador': 'ecuador', 'Uruguay': 'uruguay',
      'Guatemala': 'guatemala', 'Cuba': 'cuba', 'Panama': 'panama',
      'Costa Rica': 'costa_rica', 'Nicaragua': 'nicaragua',
      'New Zealand': 'new_zealand', 'Papua New Guinea': 'papua_new_guinea', 'Fiji': 'fiji',
      'Israel': 'israel', 'Lebanon': 'lebanon', 'Syria': 'syria', 'Jordan': 'jordan',
      'Iraq': 'iraq', 'Yemen': 'yemen', 'Oman': 'oman', 'United Arab Emirates': 'uae',
      'Kuwait': 'kuwait', 'Qatar': 'qatar'
    };
    return countryMapping[countryName] || countryName.toLowerCase().replace(/\s+/g, '_');
  };

  // تحميل D3 وبيانات الخريطة مرة واحدة فقط
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

  // رسم وتحديث الخريطة عند تغيير البيانات - محسّن للأداء
  useEffect(() => {
    if (!mapData || !window.d3) return;
    
    // تقليل إعادة الرسم بـ debounce
    const timer = setTimeout(() => {
      drawMap();
    }, 150);
    
    return () => clearTimeout(timer);
  }, [mapData, countries, currentPlayer]);

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

  // دالة الرسم المحسنة
  const drawMap = () => {
    const svg = window.d3.select(svgRef.current);
    
    // مسح المحتوى السابق بالكامل
    svg.selectAll("*").remove();
    
    // إضافة log للتحقق من حالة countries
    console.log('🗺️ رسم الخريطة - حالة countries:', countries);
    
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
    
    // رسم الدول مع تحسينات
    const countriesSelection = g.selectAll(".country")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        
        // تحديد اللون بناءً على حالة الدولة
        if (!isCountryAvailable(countryId)) {
          return '#666666'; // دول غير متاحة - رمادي غامق
        }
        
        if (country && country.owner !== undefined && country.owner !== null) {
          return playerColors[country.owner] || '#888888'; // دول مملوكة - لون اللاعب
        }
        
        return '#cccccc'; // دول فارغة ومتاحة - رمادي فاتح
      })
      .attr("stroke", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        
        if (!isCountryAvailable(countryId)) {
          return '#444444';
        }
        
        if (currentPlayer && country && country.owner === currentPlayer.id) {
          return '#FFD700'; // حدود ذهبية للاعب الحالي
        }
        
        return '#2c3e50';
      })
      .attr("stroke-width", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        
        if (currentPlayer && country && country.owner === currentPlayer.id) {
          return 3; // حدود أعرض للاعب الحالي
        }
        
        return 1;
      })
      .style("cursor", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        return isCountryAvailable(countryId) ? 'pointer' : 'not-allowed';
      })
      .on("mouseover", function(event, d) {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        const number = regionNumbers[countryName] || '1';
        
        let ownerInfo = 'غير محتلة';
        let troopsInfo = '';
        let availabilityInfo = '';
        
        // إضافة معلومات التوفر
        if (isCountryAvailable(countryId)) {
          availabilityInfo = '✅ متاحة للعب';
        } else {
          availabilityInfo = '❌ غير متاحة';
        }
        
        if (country && country.owner !== undefined && country.owner !== null) {
          ownerInfo = `مملوكة - لاعب ${country.owner + 1}`;
          troopsInfo = `\nالجنود: ${country.troops || 1}`;
        }
        
        setTooltip({
          show: true,
          x: event.pageX,
          y: event.pageY,
          content: `${countryName}\n${availabilityInfo}\n${ownerInfo}${troopsInfo}\nمناطق: ${number}`
        });
      })
      .on("mouseout", () => {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      })
      .on("click", function(event, d) {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        // منع النقر على الدول غير المتاحة
        if (!isCountryAvailable(countryId)) {
          alert(`❌ ${countryName} غير متاحة في هذه اللعبة!`);
          return;
        }
        
        if (onCountryClick) {
          onCountryClick(countryId);
        }
      });

    // رسم أرقام الجنود على الدول المحتلة
    const troopsData = [];
    mapData.features.forEach(d => {
      const countryName = d.properties.NAME || d.properties.name;
      const countryId = getCountryId(countryName);
      const country = countries[countryId];
      
      if (country && country.owner !== undefined && country.owner !== null && country.troops) {
        const centroid = path.centroid(d);
        if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
          troopsData.push({
            countryName: countryName,
            countryId: countryId,
            troops: country.troops,
            owner: country.owner,
            centroid: centroid
          });
        }
      }
    });

    g.selectAll(".country-number")
      .data(troopsData)
      .enter()
      .append("text")
      .attr("class", "country-number")
      .attr("x", d => d.centroid[0])
      .attr("y", d => d.centroid[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("stroke", "#2c3e50")
      .style("stroke-width", "2px")
      .style("pointer-events", "none")
      .text(d => d.troops);
  };

  // خريطة بديلة بسيطة (في حالة فشل تحميل D3)
  const renderFallbackMap = () => {
    const continents = [
      { id: 'usa', name: 'أمريكا', x: 200, y: 250, color: countries['usa']?.owner },
      { id: 'canada', name: 'كندا', x: 200, y: 150, color: countries['canada']?.owner },
      { id: 'brazil', name: 'البرازيل', x: 300, y: 400, color: countries['brazil']?.owner },
      { id: 'france', name: 'فرنسا', x: 500, y: 200, color: countries['france']?.owner },
      { id: 'germany', name: 'ألمانيا', x: 520, y: 180, color: countries['germany']?.owner },
      { id: 'egypt', name: 'مصر', x: 550, y: 300, color: countries['egypt']?.owner },
      { id: 'china', name: 'الصين', x: 750, y: 250, color: countries['china']?.owner },
      { id: 'russia', name: 'روسيا', x: 650, y: 150, color: countries['russia']?.owner },
      { id: 'australia', name: 'أستراليا', x: 800, y: 450, color: countries['australia']?.owner },
    ];

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ background: '#4A9EFF' }}
      >
        {continents.map(continent => (
          <g key={continent.id}>
            <circle
              cx={continent.x}
              cy={continent.y}
              r={40}
              fill={continent.color !== undefined && continent.color !== null ? 
                playerColors[continent.color] : 
                (isCountryAvailable(continent.id) ? '#888888' : '#cccccc')
              }
              stroke={continent.color === currentPlayer?.id ? '#FFD700' : '#2c3e50'}
              strokeWidth={continent.color === currentPlayer?.id ? 3 : 2}
              style={{ 
                cursor: isCountryAvailable(continent.id) ? 'pointer' : 'not-allowed' 
              }}
              onClick={() => {
                if (isCountryAvailable(continent.id) && onCountryClick) {
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
                fill: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                pointerEvents: 'none'
              }}
            >
              {continent.name}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-semibold">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {mapData ? (
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={{ background: '#4A9EFF' }}
        />
      ) : (
        renderFallbackMap()
      )}
      
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="absolute bg-black bg-opacity-80 text-white p-2 rounded text-sm pointer-events-none z-50 whitespace-pre-line"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}