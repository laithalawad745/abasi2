// components/RiskGame/WorldMapD3.jsx
'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function WorldMapD3({ countries, onCountryClick, currentPlayer, actionType }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);

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

  // أرقام المناطق (نفس الكود السابق)
  const regionNumbers = {
    'United States of America': '1', 'Canada': '3', 'Mexico': '1', 'Brazil': '1',
    'Argentina': '1', 'Russia': '2', 'China': '12', 'India': '17', 'Australia': '10',
    'Germany': '13', 'France': '1', 'United Kingdom': '1', 'Egypt': '1', 'Nigeria': '13',
    'South Africa': '1', 'Japan': '1', 'Mongolia': '9', 'Kazakhstan': '1', 'Turkey': '1',
    'Iran': '1', 'Saudi Arabia': '1'
  };

  useEffect(() => {
    loadD3AndCreateMap();
  }, []);

  useEffect(() => {
    if (mapInitialized) {
      updateMapColors();
    }
  }, [countries, currentPlayer, actionType, mapInitialized]);

  const loadD3AndCreateMap = async () => {
    if (!window.d3) {
      await loadD3Scripts();
    }
    await createMap();
  };

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

  const createMap = async () => {
    try {
      setIsLoading(true);
      
      // تحميل بيانات العالم
      const worldData = await window.d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const countriesData = window.topojson.feature(worldData, worldData.objects.countries);
      
      // إعداد SVG
      const svg = window.d3.select(svgRef.current);
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
          g.selectAll(".country-number")
            .style("font-size", Math.max(8, 14 / event.transform.k) + "px");
        });
        
      svg.call(zoom);
      
      // رسم الدول
      g.selectAll(".country")
        .data(countriesData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => getCountryColor(d))
        .attr("stroke", d => getCountryStroke(d))
        .attr("stroke-width", d => getCountryStrokeWidth(d))
        .style("cursor", "pointer")
        .style("transition", "all 0.3s ease")
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut)
        .on("click", handleCountryClick);
      
      // إضافة أرقام المناطق
      setTimeout(() => {
        addRegionNumbers(countriesData, g, path);
      }, 500);
      
      setMapInitialized(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('خطأ في تحميل الخريطة:', error);
      createFallbackMap();
    }
  };

  const createFallbackMap = () => {
    const svg = window.d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const projection = window.d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);
    
    const continentData = [
      {name: 'أمريكا الشمالية', coords: [[-100, 50]], number: '3', id: 'usa'},
      {name: 'أمريكا الجنوبية', coords: [[-60, -15]], number: '1', id: 'brazil'},
      {name: 'أفريقيا', coords: [[20, 0]], number: '13', id: 'egypt'},
      {name: 'أوروبا', coords: [[10, 55]], number: '1', id: 'france'},
      {name: 'آسيا', coords: [[100, 35]], number: '12', id: 'china'},
      {name: 'أستراليا', coords: [[135, -25]], number: '10', id: 'australia'}
    ];
    
    continentData.forEach(continent => {
      const coords = projection(continent.coords[0]);
      const countryId = continent.id;
      const country = countries[countryId];
      
      svg.append("circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", 50)
        .attr("fill", getCountryColorById(countryId))
        .attr("stroke", getCountryStrokeById(countryId))
        .attr("stroke-width", getCountryStrokeWidthById(countryId))
        .style("cursor", "pointer")
        .on("click", () => onCountryClick && onCountryClick(countryId));
      
      svg.append("text")
        .attr("x", coords[0])
        .attr("y", coords[1])
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .style("stroke", "#2c3e50")
        .style("stroke-width", "1px")
        .style("pointer-events", "none")
        .text(continent.number);
    });
    
    setMapInitialized(true);
    setIsLoading(false);
  };

  const addRegionNumbers = (countriesData, g, path) => {
    const numberData = [];
    
    countriesData.features.forEach(feature => {
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

  const updateMapColors = () => {
    if (!window.d3 || !mapInitialized) return;
    
    const svg = window.d3.select(svgRef.current);
    svg.selectAll(".country")
      .attr("fill", function(d) { return getCountryColor(d); })
      .attr("stroke", function(d) { return getCountryStroke(d); })
      .attr("stroke-width", function(d) { return getCountryStrokeWidth(d); });
  };

  // الحصول على لون الدولة (إما رمادي أو لون اللاعب)
  const getCountryColor = (feature) => {
    const countryName = feature.properties.NAME || feature.properties.name || 'Unknown';
    const countryId = getCountryId(countryName);
    const country = countries[countryId];
    
    // إذا كانت الدولة محتلة، استخدم لون اللاعب
    if (country && country.owner !== undefined && country.owner !== null) {
      return playerColors[country.owner] || '#666666';
    }
    
    // إذا لم تكن محتلة، استخدم اللون الرمادي
    return '#888888'; // رمادي للدول غير المحتلة
  };

  // نفس الدالة لكن للاستخدام مع ID مباشر
  const getCountryColorById = (countryId) => {
    const country = countries[countryId];
    
    if (country && country.owner !== undefined && country.owner !== null) {
      return playerColors[country.owner] || '#666666';
    }
    
    return '#888888';
  };

  const getCountryStroke = (feature) => {
    const countryName = feature.properties.NAME || feature.properties.name || 'Unknown';
    const countryId = getCountryId(countryName);
    const country = countries[countryId];
    
    if (country && country.owner === currentPlayer?.id) {
      return '#FFD700'; // ذهبي للدول المملوكة للاعب الحالي
    } else if (country && country.owner !== undefined && country.owner !== null) {
      return '#FFFFFF'; // أبيض للدول المحتلة من قبل لاعبين آخرين
    }
    return '#2c3e50'; // رمادي داكن للدول غير المحتلة
  };

  const getCountryStrokeById = (countryId) => {
    const country = countries[countryId];
    
    if (country && country.owner === currentPlayer?.id) {
      return '#FFD700';
    } else if (country && country.owner !== undefined && country.owner !== null) {
      return '#FFFFFF';
    }
    return '#2c3e50';
  };

  const getCountryStrokeWidth = (feature) => {
    const countryName = feature.properties.NAME || feature.properties.name || 'Unknown';
    const countryId = getCountryId(countryName);
    const country = countries[countryId];
    
    if (country && country.owner === currentPlayer?.id) {
      return 3; // حدود أكثر سماكة للدول المملوكة للاعب الحالي
    }
    return 1.5;
  };

  const getCountryStrokeWidthById = (countryId) => {
    const country = countries[countryId];
    
    if (country && country.owner === currentPlayer?.id) {
      return 3;
    }
    return 1.5;
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

  const handleMouseOver = (event, feature) => {
    const countryName = feature.properties.NAME || feature.properties.name || 'منطقة غير معروفة';
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
      content: `${countryName}\nقوة المنطقة: ${number}\nالمالك: ${ownerInfo}\n${troopsInfo}\nانقر للتفاعل`
    });
  };

  const handleMouseMove = (event) => {
    setTooltip(prev => ({
      ...prev,
      x: event.pageX + 10,
      y: event.pageY - 10
    }));
  };

  const handleMouseOut = () => {
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  const handleCountryClick = (event, feature) => {
    const countryName = feature.properties.NAME || feature.properties.name;
    const countryId = getCountryId(countryName);
    
    if (onCountryClick) {
      onCountryClick(countryId);
    }
  };

  return (
    <div className="fixed inset-0 pt-20 pb-4 overflow-hidden">
      <div className="w-full h-full relative bg-gradient-to-br from-blue-500 to-blue-700">
        
        {/* SVG الخريطة */}
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-yellow-400" style={{ backgroundColor: currentPlayer?.color || '#666' }}></div>
              <span className="text-gray-300">دولك الحالية</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded border border-white"></div>
              <span className="text-gray-300">دول اللاعبين الآخرين</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}