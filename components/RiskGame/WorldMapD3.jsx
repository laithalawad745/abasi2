// components/RiskGame/WorldMapD3.jsx
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
      'Mongolia': 'mongolia', 'Thailand': 'thailand', 'Vietnam': 'vietnam'
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

  // رسم وتحديث الخريطة عند تغيير البيانات
  useEffect(() => {
    if (!mapData || !window.d3) return;
    
    drawMap();
  }, [mapData, countries, currentPlayer]); // مهم: تحديث عند تغيير countries

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

  const drawMap = () => {
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
        
        if (country && country.owner !== undefined && country.owner !== null) {
          const color = playerColors[country.owner] || '#666666';
          console.log(`رسم ${countryId}: مالك=${country.owner}, لون=${color}`);
          return color;
        }
        return '#888888';
      })
      .attr("stroke", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        
        if (country && country.owner === currentPlayer?.id) {
          return '#FFD700';
        } else if (country && country.owner !== undefined && country.owner !== null) {
          return '#FFFFFF';
        }
        return '#2c3e50';
      })
      .attr("stroke-width", d => {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        
        if (country && country.owner === currentPlayer?.id) {
          return 3;
        }
        return 1.5;
      })
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        const country = countries[countryId];
        const number = regionNumbers[countryName] || '1';
        
        let ownerInfo = 'غير محتلة';
        let troopsInfo = '';
        
        if (country && country.owner !== undefined && country.owner !== null) {
          ownerInfo = `لاعب ${country.owner + 1}`;
          troopsInfo = `الجنود: ${country.troops}`;
        }
        
        setTooltip({
          show: true,
          x: event.pageX + 10,
          y: event.pageY - 10,
          content: `${countryName}\nقوة المنطقة: ${number}\nالمالك: ${ownerInfo}\n${troopsInfo}`
        });
      })
      .on("mousemove", function(event) {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 10,
          y: event.pageY - 10
        }));
      })
      .on("mouseout", function() {
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      })
      .on("click", function(event, d) {
        const countryName = d.properties.NAME || d.properties.name;
        const countryId = getCountryId(countryName);
        
        console.log(`نقر على ${countryName} (${countryId})`);
        
        if (onCountryClick) {
          onCountryClick(countryId);
        }
      });
    
    // إضافة أرقام المناطق
    const numberData = [];
    mapData.features.forEach(feature => {
      const countryName = feature.properties.NAME || feature.properties.name;
      const number = regionNumbers[countryName];
      
      if (number && feature.geometry) {
        const centroid = path.centroid(feature);
        if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
          numberData.push({
            country: countryName,
            number: number,
            centroid: centroid
          });
        }
      }
    });
    
    g.selectAll(".country-number")
      .data(numberData)
      .enter()
      .append("text")
      .attr("class", "country-number")
      .attr("x", d => d.centroid[0])
      .attr("y", d => d.centroid[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("stroke", "#2c3e50")
      .style("stroke-width", "1px")
      .style("pointer-events", "none")
      .text(d => d.number);
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
              fill={continent.color !== undefined && continent.color !== null ? playerColors[continent.color] : '#888888'}
              stroke={continent.color === currentPlayer?.id ? '#FFD700' : '#2c3e50'}
              strokeWidth={continent.color === currentPlayer?.id ? 3 : 2}
              style={{ cursor: 'pointer' }}
              onClick={() => onCountryClick && onCountryClick(continent.id)}
            />
            <text
              x={continent.x}
              y={continent.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {continent.name}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 pt-20 pb-4 overflow-hidden">
      <div className="w-full h-full relative bg-gradient-to-br from-blue-500 to-blue-700">
        
        {/* الخريطة */}
        {!isLoading && mapData ? (
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{
              border: '3px solid #2c3e50',
              borderRadius: '8px',
              background: '#4A9EFF'
            }}
          />
        ) : !isLoading ? (
          renderFallbackMap()
        ) : null}
        
        {/* Tooltip */}
        {tooltip.show && (
          <div
            className="absolute bg-slate-800/95 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-50 whitespace-pre-line shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {tooltip.content}
          </div>
        )}
        
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

        {/* رسالة التحميل */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-white">جاري تحميل الخريطة العالمية...</div>
            </div>
          </div>
        )}

        {/* مفتاح الألوان */}
        <div className="absolute bottom-20 left-4 bg-slate-800/90 backdrop-blur-lg rounded-lg p-4 shadow-2xl z-30">
          <h4 className="text-white font-bold text-sm mb-2">مفتاح الألوان:</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded border border-white"></div>
              <span className="text-gray-300">دول غير محتلة</span>
            </div>
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-white"
                  style={{ backgroundColor: playerColors[index] }}
                ></div>
                <span className="text-gray-300">
                  {player?.name || `لاعب ${index + 1}`}
                </span>
              </div>
            )).filter((_, i) => i < 4)}
          </div>
        </div>

        {/* معلومات الدول للتشخيص */}
        <div className="absolute top-4 right-4 bg-white/90 rounded p-2 text-xs">
          <div>دول محتلة: {Object.values(countries).filter(c => c.owner !== null).length}</div>
          <div>دول فارغة: {Object.values(countries).filter(c => c.owner === null).length}</div>
          {currentPlayer && <div>الدور: {currentPlayer.name}</div>}
        </div>
      </div>
    </div>
  );
}

// متغير للاعبين (للعرض في مفتاح الألوان)
const players = [
  { name: 'لاعب 1' },
  { name: 'لاعب 2' },
  { name: 'لاعب 3' },
  { name: 'لاعب 4' }
];



