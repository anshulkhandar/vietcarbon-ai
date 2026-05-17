import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VIETNAM_CITIES } from '../utils/vietnamData';
import { Layers, Globe, Eye, RotateCcw, X, Factory, Car, MapPin, Sun, Moon, Wind, Zap } from 'lucide-react';

// ─── Colours ─────────────────────────────────────────────────────────────────
const LAYER_META = {
  carbon:     { label:'CO₂ Emissions',       icon:'🏭', color:'#ff6d00', key:'carbonEmission' },
  climate:    { label:'Climate Risk',         icon:'🌡', color:'#7c4dff', key:'climateRisk' },
  traffic:    { label:'Traffic Density',      icon:'🚗', color:'#ffb300', key:'trafficDensity' },
  solar:      { label:'Solar Potential',      icon:'☀️', color:'#ffe000', key:'solarAvailability' },
  flood:      { label:'Flood Risk',           icon:'🌊', color:'#00bcd4', key:'floodRisk' },
  population: { label:'Population Density',  icon:'👥', color:'#e040fb', key:'population' },
  factory:    { label:'Industrial Activity',  icon:'⚙️', color:'#ef5350', key:'industrialActivity' },
  renewable:  { label:'Renewable Energy',    icon:'⚡', color:'#00ff88', key:'renewablePercent' },
};

const MAP_STYLES = {
  satellite: {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      esri: {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Esri World Imagery'
      }
    },
    layers: [
      { id: 'esri-satellite', type: 'raster', source: 'esri', paint: { 'raster-brightness-min': 0.18, 'raster-brightness-max': 0.92, 'raster-saturation': 0.28, 'raster-contrast': 0.22 } },
      { id: 'green-night-overlay', type: 'background', paint: { 'background-color': 'rgba(0,18,7,0.16)' } }
    ]
  },
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  terrain: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

// ─── Real Factories / Industrial zones ───────────────────────────────────────
const FACTORIES = [
  { id:'f1',  name:'Cat Lai Container Port',        city:'Ho Chi Minh City', type:'port',       lat:10.783, lng:106.756, co2:7.92, sector:'Logistics/Port',      workers:18000, img:'/images/facility/f1.jpeg' },
  { id:'f2',  name:'Phu My Industrial Zone',         city:'Ho Chi Minh City', type:'factory',    lat:10.638, lng:107.021, co2:6.35, sector:'Petrochemical',       workers:45000, img:'/images/facility/f2.png' },
  { id:'f3',  name:'Bien Hoa Industrial Zone',       city:'Ho Chi Minh City', type:'factory',    lat:10.946, lng:106.825, co2:4.82, sector:'Manufacturing',       workers:62000, img:'/images/facility/f3.jpg' },
  { id:'f4',  name:'Tan Thuan Export Processing',    city:'Ho Chi Minh City', type:'factory',    lat:10.741, lng:106.727, co2:2.14, sector:'Electronics',         workers:28000, img:'/images/facility/f4.jpg' },
  { id:'f5',  name:'Thang Long Industrial Park',     city:'Hanoi',            type:'factory',    lat:21.084, lng:105.753, co2:5.88, sector:'Auto/Electronics',    workers:55000, img:'/images/facility/f5.webp' },
  { id:'f6',  name:'Noi Bai Industrial Zone',        city:'Hanoi',            type:'factory',    lat:21.192, lng:105.806, co2:3.41, sector:'Aerospace/Logistics', workers:22000, img:'/images/facility/f6.jpg' },
  { id:'f7',  name:'Ha Noi Thermal Power Plant',     city:'Hanoi',            type:'powerplant', lat:21.012, lng:105.842, co2:4.20, sector:'Coal Power',          workers:3200,  img:'/images/facility/f7.png' },
  { id:'f8',  name:'Dinh Vu Industrial Area',        city:'Hai Phong',        type:'factory',    lat:20.831, lng:106.812, co2:8.75, sector:'Steel/Cement',        workers:71000, img:'/images/facility/f8.jpg' },
  { id:'f9',  name:'Hai Phong Deep Sea Port',        city:'Hai Phong',        type:'port',       lat:20.867, lng:106.712, co2:3.28, sector:'Shipping',            workers:9400,  img:'/images/facility/f9.jpg' },
  { id:'f10', name:'Hoa Khanh Industrial Zone',      city:'Da Nang',          type:'factory',    lat:16.088, lng:108.155, co2:4.92, sector:'Textiles/Electronics',workers:38000, img:'/images/facility/f10.jpg' },
  { id:'f11', name:'Lien Chieu Industrial Zone',     city:'Da Nang',          type:'factory',    lat:16.097, lng:108.136, co2:2.11, sector:'Steel/Plastics',      workers:12000, img:'/images/facility/f11.jpg' },
  { id:'f12', name:'Tra Noc Industrial Zone',        city:'Can Tho',          type:'factory',    lat:10.088, lng:105.712, co2:2.10, sector:'Agro-processing',     workers:18500, img:'/images/facility/f12.webp' },
  { id:'f13', name:'Ha Long Coal Power Plant',       city:'Quang Ninh',       type:'powerplant', lat:21.038, lng:107.218, co2:9.40, sector:'Coal Power',          workers:5600,  img:'/images/facility/f13.webp' },
  { id:'f14', name:'Cai Lan International Port',     city:'Quang Ninh',       type:'port',       lat:20.968, lng:107.062, co2:2.87, sector:'Container Shipping',  workers:7800,  img:'/images/facility/f14.jpg' },
  { id:'f15', name:'Dung Quat Oil Refinery',         city:'Quang Ngai',       type:'powerplant', lat:15.388, lng:108.737, co2:6.80, sector:'Oil Refinery',        workers:4200,  img:'/images/facility/f15.jpg' },
  { id:'f16', name:'Thai Nguyen Steel Complex',      city:'Thai Nguyen',      type:'factory',    lat:21.594, lng:105.848, co2:5.20, sector:'Steel Production',    workers:32000, img:'/images/facility/f16.jpg' },
];

// ─── Renewable Energy Sites ───────────────────────────────────────────────────
const RENEWABLE_SITES = [
  { id:'r1',  name:'Thuan Nam Solar Farm 350MW',    type:'solar',   lat:11.558, lng:108.989, capacity:'350 MW', province:'Ninh Thuan',  efficiency:'94%',  img:'/images/facility/r1.jpg' },
  { id:'r2',  name:'Mui Ne Wind + Solar Hybrid',    type:'wind',    lat:10.934, lng:108.287, capacity:'120 MW', province:'Binh Thuan',  efficiency:'82%',  img:'/images/facility/r2.jpg' },
  { id:'r3',  name:'Bac Lieu Offshore Wind Farm',   type:'wind',    lat:9.295,  lng:105.720, capacity:'99 MW',  province:'Bac Lieu',    efficiency:'79%',  img:'/images/facility/r3.jpg' },
  { id:'r4',  name:'Quang Tri Wind Corridor',       type:'wind',    lat:16.756, lng:107.199, capacity:'200 MW', province:'Quang Tri',   efficiency:'85%',  img:'/images/facility/r4.jpg' },
  { id:'r5',  name:'Ha Tinh Offshore Wind 400MW',   type:'wind',    lat:18.337, lng:105.899, capacity:'400 MW', province:'Ha Tinh',     efficiency:'88%',  img:'/images/facility/r5.jpg' },
  { id:'r6',  name:'Dak Lak Solar Expansion',       type:'solar',   lat:12.662, lng:108.049, capacity:'280 MW', province:'Dak Lak',     efficiency:'91%',  img:'/images/facility/r6.webp' },
  { id:'r7',  name:'Son La Hydro Dam 2400MW',        type:'hydro',   lat:21.348, lng:103.910, capacity:'2400 MW',province:'Son La',      efficiency:'92%',  img:'/images/facility/r7.jpg' },
  { id:'r8',  name:'Hoa Binh Hydropower Plant',     type:'hydro',   lat:20.819, lng:105.339, capacity:'1920 MW',province:'Hoa Binh',    efficiency:'90%',  img:'/images/facility/r8.jpg' },
  { id:'r9',  name:'Lam Dong Offshore Wind Hub',    type:'wind',    lat:11.575, lng:108.201, capacity:'150 MW', province:'Lam Dong',    efficiency:'83%',  img:'/images/facility/r9.jpg' },
  { id:'r10', name:'Floating Solar Tri An Reservoir',type:'solar',  lat:11.086, lng:107.011, capacity:'50 MW',  province:'Dong Nai',    efficiency:'88%',  img:'/images/facility/r10.webp' },
  { id:'r11', name:'Soc Trang Coastal Wind',        type:'wind',    lat:9.603,  lng:106.082, capacity:'180 MW', province:'Soc Trang',   efficiency:'81%',  img:'/images/facility/r11.jpg' },
  { id:'r12', name:'Binh Phuoc Solar Park',         type:'solar',   lat:11.765, lng:106.910, capacity:'200 MW', province:'Binh Phuoc',  efficiency:'89%',  img:'/images/facility/r12.jpg' },
  { id:'r13', name:'Tay Ninh Solar + Biomass',      type:'solar',   lat:11.310, lng:106.098, capacity:'120 MW', province:'Tay Ninh',    efficiency:'86%',  img:'/images/facility/r13.jpg' },
];

// ─── Traffic CO2 Hotspots ─────────────────────────────────────────────────────
const TRAFFIC_HOTSPOTS = [
  { id:'t1',  name:'Nguyen Trai Intersection',   city:'Hanoi',            type:'intersection', lat:20.998, lng:105.838, trafficLevel:'Very High', co2Level:'Very High', cause:'Dense bike+car traffic',      img:'/images/facility/t1.jpg', h2Buses:12, evChargers:8  },
  { id:'t2',  name:'Ring Road 3',                city:'Hanoi',            type:'ringroad',     lat:21.018, lng:105.820, trafficLevel:'Very High', co2Level:'Very High', cause:'Heavy logistics movement',    img:'/images/facility/t2.jpg', h2Buses:20, evChargers:15 },
  { id:'t3',  name:'Nga Tu So Intersection',     city:'Hanoi',            type:'intersection', lat:20.994, lng:105.851, trafficLevel:'Extreme',   co2Level:'Very High', cause:'Bike+Bus+Car CO₂',            img:'/images/facility/t3.jpg', h2Buses:8,  evChargers:6  },
  { id:'t4',  name:'Ben Thanh Roundabout',       city:'Ho Chi Minh City', type:'intersection', lat:10.772, lng:106.698, trafficLevel:'Extreme',   co2Level:'Extreme',   cause:'Central business traffic',    img:'/images/facility/t4.jpg', h2Buses:30, evChargers:20 },
  { id:'t5',  name:'Tan Son Nhat Airport Zone',  city:'Ho Chi Minh City', type:'airport',      lat:10.818, lng:106.654, trafficLevel:'Extreme',   co2Level:'Extreme',   cause:'Airport route+fuel emissions',img:'/images/facility/t5.webp', h2Buses:15, evChargers:25 },
  { id:'t6',  name:'National Highway 1A HCMC',   city:'Ho Chi Minh City', type:'highway',      lat:10.750, lng:106.720, trafficLevel:'Extreme',   co2Level:'Extreme',   cause:'Truck/logistics corridor',    img:'/images/facility/t6.jpg', h2Buses:25, evChargers:18 },
  { id:'t7',  name:'Hang Xanh Intersection',     city:'Ho Chi Minh City', type:'intersection', lat:10.800, lng:106.712, trafficLevel:'Very High', co2Level:'Very High', cause:'Motorbike pollution',         img:'/images/facility/t7.jpg', h2Buses:10, evChargers:8  },
  { id:'t8',  name:'Hai Phong Port Roads',       city:'Hai Phong',        type:'highway',      lat:20.844, lng:106.685, trafficLevel:'Very High', co2Level:'Very High', cause:'Container trucks',            img:'/images/facility/t8.jpg', h2Buses:18, evChargers:12 },
  { id:'t9',  name:'Dragon Bridge Zone',         city:'Da Nang',          type:'bridge',       lat:16.061, lng:108.227, trafficLevel:'Medium',    co2Level:'Medium',    cause:'Tourism traffic',             img:'/images/facility/t9.jpg', h2Buses:6,  evChargers:10 },
  { id:'t10', name:'Can Tho Central Roads',      city:'Can Tho',          type:'urban',        lat:10.046, lng:105.782, trafficLevel:'Medium',    co2Level:'Medium',    cause:'River-city congestion',       img:'/images/facility/t10.jpg', h2Buses:4,  evChargers:6  },
];

// ─── Traffic Routes ───────────────────────────────────────────────────────────
const TRAFFIC_ROUTES = [
  { id:'hr1', name:'National Highway 1A',          color:'#ffb300', width:3, coords:[[105.842,21.028],[106.052,20.712],[106.415,20.144],[107.102,16.468],[108.202,16.054],[108.442,15.117],[107.584,10.823]] },
  { id:'hr2', name:'HCMC Ring Road 3',              color:'#ff6d00', width:2.5, coords:[[106.590,10.910],[106.720,10.930],[106.810,10.870],[106.840,10.780],[106.790,10.700],[106.680,10.680],[106.580,10.740],[106.540,10.830],[106.590,10.910]] },
  { id:'hr3', name:'Hanoi Ring Road 2',             color:'#ff6d00', width:2.5, coords:[[105.780,21.068],[105.858,21.082],[105.915,21.042],[105.902,20.988],[105.840,20.968],[105.770,21.000],[105.758,21.040],[105.780,21.068]] },
  { id:'hr4', name:'HCM–Vung Tau Expressway',       color:'#00e5ff', width:2, coords:[[106.680,10.780],[107.021,10.638]] },
  { id:'hr5', name:'Hanoi–Hai Phong Expressway',    color:'#00e5ff', width:2, coords:[[105.854,21.028],[106.148,20.980],[106.365,20.912],[106.688,20.845]] },
  { id:'hr6', name:'Da Nang Coastal Route',         color:'#ffb300', width:2, coords:[[108.135,16.097],[108.202,16.054],[108.247,15.880]] },
  { id:'hr7', name:'Ho Chi Minh Road (West)',       color:'#4caf50', width:1.5, coords:[[105.350,21.800],[104.800,20.400],[103.900,19.800],[104.200,17.200],[107.690,15.876]] },
];

// ─── Area Polygons (districts) ────────────────────────────────────────────────
const AREA_POLYGONS = [
  { id:'a1', name:'District 1 CBD',           city:'Ho Chi Minh City', type:'urban',      color:'#ff1744', coords:[[106.693,10.784],[106.706,10.789],[106.710,10.775],[106.700,10.768],[106.693,10.770],[106.693,10.784]] },
  { id:'a2', name:'Cat Lai Industrial Port',  city:'Ho Chi Minh City', type:'industrial', color:'#ff6d00', coords:[[106.742,10.785],[106.762,10.792],[106.775,10.778],[106.763,10.769],[106.744,10.773],[106.742,10.785]] },
  { id:'a3', name:'Dinh Vu Industrial Belt',  city:'Hai Phong',        type:'industrial', color:'#ff1744', coords:[[106.798,20.839],[106.830,20.845],[106.840,20.831],[106.822,20.820],[106.800,20.825],[106.798,20.839]] },
  { id:'a4', name:'Ba Dinh District',         city:'Hanoi',            type:'urban',      color:'#7c4dff', coords:[[105.830,21.038],[105.850,21.044],[105.858,21.032],[105.845,21.024],[105.830,21.028],[105.830,21.038]] },
  { id:'a5', name:'Hoa Khanh Industrial Zone',city:'Da Nang',          type:'industrial', color:'#ff6d00', coords:[[108.148,16.090],[108.168,16.098],[108.176,16.082],[108.158,16.074],[108.146,16.080],[108.148,16.090]] },
  { id:'a6', name:'Thang Long Industrial Park',city:'Hanoi',           type:'industrial', color:'#ff6d00', coords:[[105.745,21.090],[105.768,21.098],[105.780,21.080],[105.762,21.072],[105.744,21.078],[105.745,21.090]] },
  { id:'a7', name:'Mekong Delta Flood Zone',  city:'Can Tho',          type:'floodzone',  color:'#00bcd4', coords:[[105.680,10.080],[105.760,10.090],[105.800,10.050],[105.770,10.020],[105.690,10.025],[105.680,10.080]] },
  { id:'a8', name:'Ninh Thuan Solar Belt',    city:'Ninh Thuan',       type:'renewable',  color:'#ffb300', coords:[[108.950,11.620],[109.080,11.640],[109.100,11.520],[108.980,11.500],[108.950,11.620]] },
  { id:'a9', name:'Quang Ninh Coal Zone',     city:'Quang Ninh',       type:'industrial', color:'#ef5350', coords:[[107.080,21.020],[107.200,21.050],[107.250,21.000],[107.120,20.970],[107.080,21.020]] },
];

// ─── City images ──────────────────────────────────────────────────────────────
const CITY_IMAGES = {
  'Ho Chi Minh City': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80',
  'Hanoi':            'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&q=80',
  'Da Nang':          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
  'Hai Phong':        'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=600&q=80',
  'Can Tho':          '/images/v3.jpeg',
  'Ninh Thuan':       '/images/v1.jpeg',
  'Hue':              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'Vung Tau':         'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
  'Quang Ninh':       'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=600&q=80',
};

function layerValue(city, layer) {
  if (layer === 'population') return Math.min(100, city.population / 100000);
  return city[LAYER_META[layer]?.key] ?? city.carbonEmission;
}
function riskColor(v) {
  if (v >= 80) return '#ff1744';
  if (v >= 60) return '#ff6d00';
  if (v >= 40) return '#ffb300';
  return '#00ff88';
}
function factoryColor(type) {
  if (type === 'powerplant') return '#ff1744';
  if (type === 'port')       return '#00e5ff';
  if (type === 'solar')      return '#ffb300';
  if (type === 'wind')       return '#00ff88';
  if (type === 'hydro')      return '#00bcd4';
  return '#ff6d00';
}
function typeIcon(type) {
  return type==='powerplant'?'⚡':type==='port'?'🚢':type==='solar'?'☀️':type==='wind'?'💨':type==='hydro'?'💧':type==='intersection'?'🚦':type==='ringroad'?'🔄':type==='airport'?'✈️':'🏭';
}

function markerHtml(color, isSel) {
  const sz=isSel?56:44, dot=isSel?20:13;
  const rings=isSel?`<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};animation:mPing 1.2s ease-out infinite;"></div><div style="position:absolute;inset:-16px;border-radius:50%;border:1px solid ${color};animation:mPing 1.9s ease-out infinite 0.4s;opacity:0.4;"></div>`:'' ;
  return `<div style="position:relative;width:${sz}px;height:${sz}px;display:flex;align-items:center;justify-content:center;">${rings}<div style="position:absolute;inset:0;border-radius:50%;background:${color}18;border:1.5px solid ${color}55;"></div><div style="width:${dot}px;height:${dot}px;border-radius:50%;background:${color};box-shadow:0 0 ${isSel?24:10}px ${color};border:2px solid #ffffff88;transition:all .3s;"></div></div>`;
}
function factoryMHtml(type) {
  const c=factoryColor(type), icon=typeIcon(type);
  return `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:rgba(0,10,5,.88);border:1.5px solid ${c};border-radius:7px;box-shadow:0 0 10px ${c}66;cursor:pointer;font-size:12px;">${icon}</div>`;
}
function renewableMHtml(type) {
  const c=factoryColor(type), icon=typeIcon(type);
  return `<div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:rgba(0,20,5,.88);border:1.5px solid ${c};border-radius:50%;box-shadow:0 0 10px ${c}66;cursor:pointer;font-size:11px;">${icon}</div>`;
}
function trafficMHtml(level) {
  const c=level==='Extreme'?'#ff1744':level==='Very High'?'#ff6d00':'#ffb300';
  return `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.88);border:1.5px solid ${c};border-radius:4px;box-shadow:0 0 8px ${c}66;cursor:pointer;font-size:10px;">🚦</div>`;
}
function cityTooltip(city, color) {
  return `<div style="font-family:monospace;font-size:11px;min-width:190px;background:linear-gradient(135deg,#060f08,#0a1f0e);border:1px solid ${color}55;border-radius:12px;padding:11px;color:#e8f5e9;box-shadow:0 0 20px ${color}33;pointer-events:none;">
    <div style="color:${color};font-weight:700;font-size:12px;margin-bottom:6px;">${city.name}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;">
      ${[['CO₂',`${city.emissionMT}Mt`,color],['AQI',`${city.aqi}`,'#e8f5e9'],['RE%',`${city.renewablePercent}%`,'#00ff88'],['Flood',`${city.floodRisk}%`,city.floodRisk>70?'#ff6d00':'#4caf50']].map(([l,v,c])=>`<div style="background:#ffffff08;border-radius:4px;padding:3px 5px;"><div style="font-size:9px;color:#4caf50;">${l}</div><div style="color:${c};font-size:10px;font-weight:600;">${v}</div></div>`).join('')}
    </div>
    <div style="margin-top:6px;font-size:9px;color:#4caf50;text-align:center;">Click for full details + photo</div>
  </div>`;
}
function factoryTooltip(f) {
  const c=factoryColor(f.type);
  return `<div style="font-family:monospace;font-size:10px;padding:10px;background:linear-gradient(135deg,#060f08,#0a1f0e);border:1px solid ${c}44;border-radius:10px;color:#e8f5e9;min-width:170px;box-shadow:0 0 14px ${c}22;">
    <div style="color:${c};font-weight:700;margin-bottom:5px;">${f.name}</div>
    <div style="color:#4caf50;font-size:9px;">📍 ${f.city}</div>
    <div style="color:#81c784;font-size:9px;margin-top:2px;">🏭 ${f.sector}</div>
    ${f.co2>0?`<div style="color:#ff6d00;font-size:9px;margin-top:2px;">💨 CO₂: ${f.co2} Mt/yr</div>`:`<div style="color:#00ff88;font-size:9px;margin-top:2px;">🌿 Clean Energy</div>`}
    <div style="color:#e8f5e9;font-size:9px;margin-top:2px;">👷 ${f.workers.toLocaleString()} workers</div>
    <div style="color:#4caf50;font-size:8px;margin-top:4px;text-align:center;">Click for details</div>
  </div>`;
}
function renewableTooltip(r) {
  const c=factoryColor(r.type);
  return `<div style="font-family:monospace;font-size:10px;padding:10px;background:linear-gradient(135deg,#060f08,#0a1f0e);border:1px solid ${c}44;border-radius:10px;color:#e8f5e9;min-width:170px;box-shadow:0 0 14px ${c}22;">
    <div style="color:${c};font-weight:700;margin-bottom:5px;">${r.name}</div>
    <div style="color:#4caf50;font-size:9px;">📍 ${r.province}</div>
    <div style="color:#81c784;font-size:9px;margin-top:2px;">⚡ Capacity: ${r.capacity}</div>
    <div style="color:#00ff88;font-size:9px;margin-top:2px;">📊 Efficiency: ${r.efficiency}</div>
    <div style="color:#4caf50;font-size:8px;margin-top:4px;text-align:center;">Click for details</div>
  </div>`;
}
function trafficTooltip(t) {
  const c=t.trafficLevel==='Extreme'?'#ff1744':t.trafficLevel==='Very High'?'#ff6d00':'#ffb300';
  return `<div style="font-family:monospace;font-size:10px;padding:10px;background:linear-gradient(135deg,#060f08,#0a1f0e);border:1px solid ${c}44;border-radius:10px;color:#e8f5e9;min-width:180px;box-shadow:0 0 14px ${c}22;">
    <div style="color:${c};font-weight:700;margin-bottom:5px;">🚦 ${t.name}</div>
    <div style="color:#4caf50;font-size:9px;">📍 ${t.city}</div>
    <div style="color:#81c784;font-size:9px;margin-top:2px;">⚡ Traffic: ${t.trafficLevel}</div>
    <div style="color:#ff6d00;font-size:9px;margin-top:2px;">💨 CO₂: ${t.co2Level}</div>
    <div style="color:#e8f5e9;font-size:9px;margin-top:2px;">🚌 H₂ Buses: ${t.h2Buses} recommended</div>
    <div style="color:#4caf50;font-size:8px;margin-top:4px;text-align:center;">Click for AI solutions</div>
  </div>`;
}

// ─── Detail Panels ────────────────────────────────────────────────────────────
function CityPanel({ city, factories, onClose }) {
  if (!city) return null;
  const urgColor = city.urgency==='critical'?'#ff1744':city.urgency==='high'?'#ff6d00':'#ffb300';
  const cityF = factories.filter(f=>f.city===city.name||city.name.includes(f.city.split(' ')[0]));
  return (
    <div className="absolute top-3 right-14 z-20 w-80 rounded-2xl overflow-hidden" style={{background:'linear-gradient(180deg,#061209,#030d07)',border:`1px solid ${urgColor}44`,boxShadow:`0 0 32px ${urgColor}22,0 8px 40px rgba(0,0,0,0.6)`,backdropFilter:'blur(16px)',maxHeight:'90vh',overflowY:'auto'}}>
      <div className="relative h-36 flex-shrink-0">
        <img src={CITY_IMAGES[city.name]||'/images/v1.jpeg'} alt={city.name} className="w-full h-full object-cover"
          onError={e=>{e.target.src='/images/v1.jpeg';}} />
        <div className="absolute inset-0" style={{background:'linear-gradient(to top,#030d07 0%,transparent 55%)'}}/>
        <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{background:'rgba(3,13,7,.85)',border:'1px solid #00ff8833'}}><X size={11} color="#4caf50"/></button>
        <div className="absolute bottom-0 left-0 p-3">
          <div className="font-orbitron text-sm font-black" style={{color:'#fff',textShadow:'0 0 10px rgba(0,0,0,.8)'}}>{city.name}</div>
          <span className="text-xs px-1.5 py-0.5 rounded-full font-mono font-bold" style={{background:`${urgColor}22`,border:`1px solid ${urgColor}55`,color:urgColor}}>{(city.urgency||'medium').toUpperCase()}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-3 gap-1">
          {[['CO₂',`${city.emissionMT}Mt`,'#ff6d00'],['AQI',`${city.aqi}`,'#ffb300'],['RE%',`${city.renewablePercent}%`,'#00ff88'],['Flood',`${city.floodRisk}%`,'#00e5ff'],['Pop',`${(city.population/1e6).toFixed(1)}M`,'#e040fb'],['Smart',`${city.smartCityScore}`,'#00ff88']].map(([l,v,c])=>(
            <div key={l} className="p-1.5 rounded-xl text-center" style={{background:`${c}0a`,border:`1px solid ${c}22`}}>
              <div style={{fontSize:8,color:'#4caf50',fontFamily:'monospace'}}>{l}</div>
              <div className="font-orbitron font-bold" style={{color:c,fontSize:11}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="p-2 rounded-xl" style={{background:'rgba(255,109,0,.07)',border:'1px solid rgba(255,109,0,.2)'}}>
          <div style={{fontSize:9,color:'#4caf50',fontFamily:'monospace'}}>TOP CO₂ SOURCE</div>
          <div className="font-mono font-bold text-xs" style={{color:'#ff6d00'}}>{city.topCO2Area}</div>
          <div className="font-mono text-xs" style={{color:'#81c784'}}>{city.co2AreaVal} Mt/yr</div>
        </div>
        {cityF.length>0&&(
          <div>
            <div style={{fontSize:9,color:'#4caf50',fontFamily:'monospace',marginBottom:3}}>INDUSTRIAL SITES ({cityF.length})</div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {cityF.map(f=>(
                <div key={f.id} className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{background:'rgba(255,255,255,.03)',border:`1px solid ${factoryColor(f.type)}22`}}>
                  <span style={{fontSize:11}}>{typeIcon(f.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono truncate" style={{color:'#e8f5e9',fontSize:9}}>{f.name}</div>
                    <div className="font-mono" style={{color:factoryColor(f.type),fontSize:9}}>{f.co2>0?`${f.co2}Mt CO₂`:'Clean'} · {f.sector}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div style={{fontSize:9,color:'#4caf50',fontFamily:'monospace',marginBottom:3}}>CO₂ TREND 2021–2026 LIVE</div>
          <div className="flex items-end gap-0.5 h-9">
            {Object.entries({...(city.yearlyData||{}), 2026:{ emission: city.emissionMT }}).map(([yr,d])=>{
              const trendObj = {...(city.yearlyData||{}), 2026:{ emission: city.emissionMT }};
              const max=Math.max(...Object.values(trendObj).map(x=>x.emission));
              return(<div key={yr} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full rounded-t-sm" style={{height:Math.max(4,(d.emission/max)*32),background:yr==='2026'?'#ff1744':yr==='2025'?'#ff6d00':'#ff6d0055'}}/><div style={{fontSize:7,color:'#4caf50',fontFamily:'monospace'}}>{yr.slice(2)}</div></div>);
            })}
          </div>
        </div>
        <div className="p-2 rounded-xl" style={{background:'rgba(0,255,136,.05)',border:'1px solid rgba(0,255,136,.15)'}}>
          <div className="flex justify-between items-center">
            <span style={{fontSize:9,color:'#4caf50',fontFamily:'monospace'}}>CO₂ REDUCTION POTENTIAL</span>
            <span className="font-orbitron font-black text-sm" style={{color:'#00ff88'}}>{city.co2SavePotential}%</span>
          </div>
          <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{background:'rgba(0,255,136,.1)'}}>
            <div style={{width:`${city.co2SavePotential}%`,height:'100%',background:'linear-gradient(90deg,#00ff8888,#00ff88)',borderRadius:9999}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function FactoryPanel({ item, onClose }) {
  if (!item) return null;
  const c = factoryColor(item.type);
  return (
    <div className="absolute top-3 right-14 z-20 w-72 rounded-2xl overflow-hidden" style={{background:'linear-gradient(180deg,#061209,#030d07)',border:`1px solid ${c}44`,boxShadow:`0 0 28px ${c}22,0 8px 32px rgba(0,0,0,.6)`,backdropFilter:'blur(16px)'}}>
      <div className="relative h-32">
        <img src={item.img||'/images/industrial1.png'} alt={item.name} className="w-full h-full object-cover" onError={e=>{e.target.src='/images/industrial1.png';}}/>
        <div className="absolute inset-0" style={{background:'linear-gradient(to top,#030d07 0%,transparent 50%)'}}/>
        <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{background:'rgba(3,13,7,.85)',border:'1px solid rgba(255,255,255,.2)'}}><X size={11} color="#4caf50"/></button>
        <div className="absolute bottom-0 p-3">
          <div className="font-orbitron text-xs font-black" style={{color:'#fff'}}>{typeIcon(item.type)} {item.name}</div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {[['📍 Location',item.city,c],['🏭 Sector',item.sector,'#81c784'],['💨 CO₂/yr',item.co2>0?`${item.co2} Mt`:'Zero Emission 🌿',item.co2>0?'#ff6d00':'#00ff88'],['👷 Workers',item.workers?.toLocaleString(),'#e8f5e9']].map(([l,v,col])=>(
          <div key={l} className="flex justify-between items-center p-1.5 rounded-lg" style={{background:'rgba(255,255,255,.03)',border:`1px solid ${col}18`}}>
            <span style={{fontSize:9,color:'#4caf50',fontFamily:'monospace'}}>{l}</span>
            <span className="font-mono font-bold" style={{color:col,fontSize:10}}>{v}</span>
          </div>
        ))}
        {item.co2>0&&(
          <div className="p-2 rounded-xl" style={{background:'rgba(0,255,136,.05)',border:'1px solid rgba(0,255,136,.2)'}}>
            <div style={{fontSize:9,color:'#00ff88',fontFamily:'monospace',fontWeight:700}}>🤖 AI RECOMMENDATION</div>
            <div style={{fontSize:9,color:'#c8f7d0',fontFamily:'monospace',marginTop:3}}>Switch to renewable energy can reduce CO₂ by {Math.round(item.co2*0.65)} Mt/yr. Hydrogen fuel cells suitable for {item.sector} processes.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function RenewablePanel({ item, onClose }) {
  if (!item) return null;
  const c = factoryColor(item.type);
  return (
    <div className="absolute top-3 right-14 z-20 w-72 rounded-2xl overflow-hidden" style={{background:'linear-gradient(180deg,#061209,#030d07)',border:`1px solid ${c}44`,boxShadow:`0 0 28px ${c}22,0 8px 32px rgba(0,0,0,.6)`,backdropFilter:'blur(16px)'}}>
      <div className="relative h-32">
        <img src={item.img||'/images/v2.jpeg'} alt={item.name} className="w-full h-full object-cover" onError={e=>{e.target.src='/images/v2.jpeg';}}/>
        <div className="absolute inset-0" style={{background:'linear-gradient(to top,#030d07 0%,transparent 50%)'}}/>
        <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{background:'rgba(3,13,7,.85)'}}><X size={11} color="#4caf50"/></button>
        <div className="absolute bottom-0 p-3">
          <div className="font-orbitron text-xs font-black" style={{color:'#fff'}}>{typeIcon(item.type)} {item.name}</div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {[['📍 Province',item.province,c],['⚡ Capacity',item.capacity,'#00ff88'],['📊 Efficiency',item.efficiency,'#ffb300'],['🌿 CO₂ Saved',`~${(parseFloat(item.capacity)*0.0008).toFixed(1)} Mt/yr`,'#00ff88']].map(([l,v,col])=>(
          <div key={l} className="flex justify-between items-center p-1.5 rounded-lg" style={{background:'rgba(255,255,255,.03)',border:`1px solid ${col}18`}}>
            <span style={{fontSize:9,color:'#4caf50',fontFamily:'monospace'}}>{l}</span>
            <span className="font-mono font-bold" style={{color:col,fontSize:10}}>{v}</span>
          </div>
        ))}
        <div className="p-2 rounded-xl" style={{background:`${c}0a`,border:`1px solid ${c}22`}}>
          <div style={{fontSize:9,color:c,fontFamily:'monospace',fontWeight:700}}>🤖 HYDROGRID AI INSIGHT</div>
          <div style={{fontSize:9,color:'#c8f7d0',fontFamily:'monospace',marginTop:3}}>
            {item.type==='solar'?`Peak output during 10AM–3PM. Pair with electrolysis for green hydrogen. Potential H₂ production: ${(parseFloat(item.capacity)*0.12).toFixed(0)} kg/h.`:item.type==='wind'?`Best output during monsoon season. Can power ${Math.round(parseFloat(item.capacity)*50)} homes. Offshore expansion potential high.`:`Stable baseload power. Priority dispatch for hydrogen electrolysis stations.`}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrafficPanel({ item, onClose }) {
  if (!item) return null;
  const c = item.trafficLevel==='Extreme'?'#ff1744':item.trafficLevel==='Very High'?'#ff6d00':'#ffb300';
  return (
    <div className="absolute top-3 right-14 z-20 w-76 rounded-2xl overflow-hidden" style={{background:'linear-gradient(180deg,#061209,#030d07)',border:`1px solid ${c}44`,boxShadow:`0 0 28px ${c}22,0 8px 32px rgba(0,0,0,.6)`,backdropFilter:'blur(16px)',width:300}}>
      <div className="relative h-32">
        <img src={item.img||'/images/traffic1.png'} alt={item.name} className="w-full h-full object-cover" onError={e=>{e.target.src='/images/traffic1.png';}}/>
        <div className="absolute inset-0" style={{background:'linear-gradient(to top,#030d07 0%,transparent 50%)'}}/>
        <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{background:'rgba(3,13,7,.85)'}}><X size={11} color="#4caf50"/></button>
        <div className="absolute bottom-0 p-3">
          <div className="font-orbitron text-xs font-black" style={{color:'#fff'}}>🚦 {item.name}</div>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {[['📍 City',item.city,'#4caf50'],['🚗 Traffic Level',item.trafficLevel,c],['💨 CO₂ Level',item.co2Level,'#ff6d00'],['⚠ Cause',item.cause,'#e8f5e9']].map(([l,v,col])=>(
          <div key={l} className="flex justify-between items-center p-1.5 rounded-lg" style={{background:'rgba(255,255,255,.03)',border:`1px solid ${col}18`}}>
            <span style={{fontSize:9,color:'#4caf50',fontFamily:'monospace'}}>{l}</span>
            <span className="font-mono font-bold" style={{color:col,fontSize:9}}>{v}</span>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <div className="p-2 rounded-xl text-center" style={{background:'rgba(0,229,255,.07)',border:'1px solid rgba(0,229,255,.2)'}}>
            <div style={{fontSize:9,color:'#4caf50',fontFamily:'monospace'}}>🚌 H₂ Buses</div>
            <div className="font-orbitron font-bold" style={{color:'#00e5ff',fontSize:14}}>{item.h2Buses}</div>
            <div style={{fontSize:8,color:'#4caf50',fontFamily:'monospace'}}>recommended</div>
          </div>
          <div className="p-2 rounded-xl text-center" style={{background:'rgba(0,255,136,.07)',border:'1px solid rgba(0,255,136,.2)'}}>
            <div style={{fontSize:9,color:'#4caf50',fontFamily:'monospace'}}>⚡ EV Chargers</div>
            <div className="font-orbitron font-bold" style={{color:'#00ff88',fontSize:14}}>{item.evChargers}</div>
            <div style={{fontSize:8,color:'#4caf50',fontFamily:'monospace'}}>to install</div>
          </div>
        </div>
        <div className="p-2 rounded-xl" style={{background:'rgba(0,255,136,.05)',border:'1px solid rgba(0,255,136,.2)'}}>
          <div style={{fontSize:9,color:'#00ff88',fontFamily:'monospace',fontWeight:700}}>🤖 AI CONGESTION SOLUTION</div>
          <div style={{fontSize:9,color:'#c8f7d0',fontFamily:'monospace',marginTop:3}}>Deploy {item.h2Buses} hydrogen buses and {item.evChargers} EV chargers. Smart signal AI can reduce idle time by 28%. CO₂ reduction potential: {Math.round((item.h2Buses*0.12+item.evChargers*0.08)*100)/100} t/day.</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VietnamMap({ activeLayer='carbon', onCitySelect, selectedCity }) {
  const mapContainer = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({});
  const factMRef     = useRef({});
  const renMRef      = useRef({});
  const traffMRef    = useRef({});
  const [mapReady,  setMapReady]  = useState(false);
  const [mapError,  setMapError]  = useState(false);
  const [styleKey,  setStyleKey]  = useState('dark');
  const [isNight,   setIsNight]   = useState(false);
  const [is3D,      setIs3D]      = useState(false);
  const [showHeat,  setShowHeat]  = useState(true);
  const [showFact,  setShowFact]  = useState(true);
  const [showRen,   setShowRen]   = useState(true);
  const [showTraff, setShowTraff] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [hoveredCity,setHoveredCity]=useState(null);
  const [panel, setPanel] = useState({ type:null, data:null }); // unified panel state

  const closePanel = () => setPanel({ type:null, data:null });

  const addAllLayers = useCallback((map, layer='carbon') => {
    try {
      if (!map.getSource('vh')) {
        map.addSource('vh', { type:'geojson', data:{ type:'FeatureCollection', features:VIETNAM_CITIES.map(c=>({ type:'Feature', geometry:{ type:'Point', coordinates:[c.lng,c.lat] }, properties:{ v:layerValue(c,layer) } })) } });
      }
      if (!map.getLayer('heat')) {
        map.addLayer({ id:'heat', type:'heatmap', source:'vh', maxzoom:9,
          paint:{ 'heatmap-weight':['interpolate',['linear'],['get','v'],0,0,100,1], 'heatmap-intensity':['interpolate',['linear'],['zoom'],5,0.8,9,2], 'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(0,255,136,0)',0.25,'rgba(0,229,255,.4)',0.5,'rgba(255,179,0,.6)',0.75,'rgba(255,109,0,.7)',1,'rgba(255,23,68,1)'], 'heatmap-radius':['interpolate',['linear'],['zoom'],5,45,9,80], 'heatmap-opacity':0.65 }
        });
      }
      if (!map.getLayer('dots')) {
        map.addLayer({ id:'dots', type:'circle', source:'vh', minzoom:7,
          paint:{ 'circle-radius':['interpolate',['linear'],['zoom'],7,8,12,22], 'circle-color':['interpolate',['linear'],['get','v'],0,'#00ff88',40,'#ffb300',70,'#ff6d00',100,'#ff1744'], 'circle-opacity':0.85, 'circle-stroke-width':1.5, 'circle-stroke-color':'#ffffff55' }
        });
      }
      TRAFFIC_ROUTES.forEach(r => {
        if (!map.getSource(`rt-${r.id}`)) {
          map.addSource(`rt-${r.id}`, { type:'geojson', data:{ type:'Feature', geometry:{ type:'LineString', coordinates:r.coords } } });
          map.addLayer({ id:`rtbg-${r.id}`, type:'line', source:`rt-${r.id}`, layout:{'line-join':'round','line-cap':'round'}, paint:{'line-color':r.color,'line-width':r.width+4,'line-opacity':0.12,'line-blur':5} });
          map.addLayer({ id:`rtln-${r.id}`, type:'line', source:`rt-${r.id}`, layout:{'line-join':'round','line-cap':'round'}, paint:{'line-color':r.color,'line-width':r.width,'line-opacity':0.9} });
        }
      });
      AREA_POLYGONS.forEach(a => {
        if (!map.getSource(`ar-${a.id}`)) {
          map.addSource(`ar-${a.id}`, { type:'geojson', data:{ type:'Feature', geometry:{ type:'Polygon', coordinates:[a.coords] } } });
          map.addLayer({ id:`arfill-${a.id}`, type:'fill', source:`ar-${a.id}`, paint:{'fill-color':a.color,'fill-opacity':0.18} });
          map.addLayer({ id:`arbord-${a.id}`, type:'line', source:`ar-${a.id}`, paint:{'line-color':a.color,'line-width':1.5,'line-opacity':0.55} });
        }
      });
    } catch(e) { console.warn(e); }
  }, []);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;
    let cancelled = false;
    import('maplibre-gl').then(({ default:mgl }) => {
      if (cancelled) return;
      if (!document.getElementById('mgl-css')) {
        const l=document.createElement('link'); l.id='mgl-css'; l.rel='stylesheet'; l.href='https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css'; document.head.appendChild(l);
      }
      if (!document.getElementById('map-kf')) {
        const s=document.createElement('style'); s.id='map-kf';
        s.textContent='@keyframes mPing{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.6);opacity:0}}.maplibregl-popup-content{background:transparent!important;padding:0!important;border:none!important;box-shadow:none!important;}.maplibregl-popup-tip{display:none!important;}.maplibregl-ctrl-attrib{display:none!important;}.maplibregl-ctrl-logo{display:none!important;}';
        document.head.appendChild(s);
      }
      const map = new mgl.Map({ container:mapContainer.current, style:MAP_STYLES.dark, center:[107.5,16.0], zoom:5.5, pitch:0, bearing:0, antialias:true });
      map.addControl(new mgl.NavigationControl({ visualizePitch:true }), 'bottom-right');
      map.on('load', () => {
        if (cancelled) return;
        mapRef.current = map;
        addAllLayers(map, 'carbon');
        setMapReady(true);

        // City markers
        VIETNAM_CITIES.forEach(city => {
          const color=riskColor(layerValue(city,'carbon'));
          const el=document.createElement('div'); el.innerHTML=markerHtml(color,false); el.style.cssText='width:44px;height:44px;cursor:pointer;z-index:10;';
          const popup=new mgl.Popup({ closeButton:false, closeOnClick:false, offset:[0,-28] }); popup.setHTML(cityTooltip(city,color));
          new mgl.Marker({ element:el, anchor:'center' }).setLngLat([city.lng,city.lat]).addTo(map);
          el.addEventListener('mouseenter',()=>{ setHoveredCity(city.name); popup.setLngLat([city.lng,city.lat]).addTo(map); });
          el.addEventListener('mouseleave',()=>{ setHoveredCity(null); popup.remove(); });
          el.addEventListener('click',e=>{ e.stopPropagation(); onCitySelect&&onCitySelect(city); setPanel({ type:'city', data:city }); map.flyTo({ center:[city.lng,city.lat], zoom:12, pitch:35, bearing:-10, duration:1800 }); });
          markersRef.current[city.id]={ el, popup };
        });

        // Factory markers
        FACTORIES.forEach(f => {
          const el=document.createElement('div'); el.innerHTML=factoryMHtml(f.type); el.style.cssText='cursor:pointer;z-index:8;';
          const popup=new mgl.Popup({ closeButton:false, closeOnClick:false, offset:[0,-18] }); popup.setHTML(factoryTooltip(f));
          new mgl.Marker({ element:el, anchor:'center' }).setLngLat([f.lng,f.lat]).addTo(map);
          el.addEventListener('mouseenter',()=>popup.setLngLat([f.lng,f.lat]).addTo(map));
          el.addEventListener('mouseleave',()=>popup.remove());
          el.addEventListener('click',e=>{ e.stopPropagation(); setPanel({ type:'factory', data:f }); map.flyTo({ center:[f.lng,f.lat], zoom:13, pitch:35, duration:1200 }); });
          factMRef.current[f.id]={ el, popup };
        });

        // Renewable markers
        RENEWABLE_SITES.forEach(r => {
          const el=document.createElement('div'); el.innerHTML=renewableMHtml(r.type); el.style.cssText='cursor:pointer;z-index:8;';
          const popup=new mgl.Popup({ closeButton:false, closeOnClick:false, offset:[0,-16] }); popup.setHTML(renewableTooltip(r));
          new mgl.Marker({ element:el, anchor:'center' }).setLngLat([r.lng,r.lat]).addTo(map);
          el.addEventListener('mouseenter',()=>popup.setLngLat([r.lng,r.lat]).addTo(map));
          el.addEventListener('mouseleave',()=>popup.remove());
          el.addEventListener('click',e=>{ e.stopPropagation(); setPanel({ type:'renewable', data:r }); map.flyTo({ center:[r.lng,r.lat], zoom:13, pitch:30, duration:1200 }); });
          renMRef.current[r.id]={ el, popup };
        });

        // Traffic hotspot markers
        TRAFFIC_HOTSPOTS.forEach(t => {
          const el=document.createElement('div'); el.innerHTML=trafficMHtml(t.trafficLevel); el.style.cssText='cursor:pointer;z-index:9;';
          const popup=new mgl.Popup({ closeButton:false, closeOnClick:false, offset:[0,-14] }); popup.setHTML(trafficTooltip(t));
          new mgl.Marker({ element:el, anchor:'center' }).setLngLat([t.lng,t.lat]).addTo(map);
          el.addEventListener('mouseenter',()=>popup.setLngLat([t.lng,t.lat]).addTo(map));
          el.addEventListener('mouseleave',()=>popup.remove());
          el.addEventListener('click',e=>{ e.stopPropagation(); setPanel({ type:'traffic', data:t }); map.flyTo({ center:[t.lng,t.lat], zoom:14, pitch:30, duration:1200 }); });
          traffMRef.current[t.id]={ el, popup };
        });
      });
      map.on('error', ()=>{ if(!cancelled) setMapError(true); });
    }).catch(()=>setMapError(true));
    return ()=>{ cancelled=true; if(mapRef.current){mapRef.current.remove();mapRef.current=null;} markersRef.current={}; factMRef.current={}; renMRef.current={}; traffMRef.current={}; };
  }, []); // eslint-disable-line

  // Update city markers on layer change
  useEffect(() => {
    if (!mapReady) return;
    VIETNAM_CITIES.forEach(city => {
      const m=markersRef.current[city.id]; if(!m) return;
      const color=riskColor(layerValue(city,activeLayer));
      const isSel=selectedCity&&(selectedCity===city.name||selectedCity?.name===city.name||selectedCity?.id===city.id);
      m.el.innerHTML=markerHtml(color,isSel); m.el.style.width=isSel?'56px':'44px'; m.el.style.height=isSel?'56px':'44px';
      m.popup.setHTML(cityTooltip(city,color));
    });
  }, [activeLayer,selectedCity,mapReady]);

  // Update heatmap source
  useEffect(() => {
    if (!mapReady||!mapRef.current) return;
    try { const s=mapRef.current.getSource('vh'); if(s) s.setData({ type:'FeatureCollection', features:VIETNAM_CITIES.map(c=>({ type:'Feature', geometry:{ type:'Point', coordinates:[c.lng,c.lat] }, properties:{ v:layerValue(c,activeLayer) } })) }); } catch {}
  }, [activeLayer, mapReady]);

  // Visibility toggles
  useEffect(() => {
    if (!mapReady||!mapRef.current) return;
    try { if(mapRef.current.getLayer('heat')) mapRef.current.setLayoutProperty('heat','visibility',showHeat?'visible':'none'); } catch {}
  }, [showHeat, mapReady]);
  useEffect(() => { if(!mapReady) return; Object.values(factMRef.current).forEach(({el})=>el.style.display=showFact?'':'none'); }, [showFact, mapReady]);
  useEffect(() => { if(!mapReady) return; Object.values(renMRef.current).forEach(({el})=>el.style.display=showRen?'':'none'); }, [showRen, mapReady]);
  useEffect(() => { if(!mapReady) return; Object.values(traffMRef.current).forEach(({el})=>el.style.display=showTraff?'':'none'); }, [showTraff, mapReady]);
  useEffect(() => {
    if (!mapReady||!mapRef.current) return;
    TRAFFIC_ROUTES.forEach(r => { ['rtbg','rtln'].forEach(p=>{ try { if(mapRef.current.getLayer(`${p}-${r.id}`)) mapRef.current.setLayoutProperty(`${p}-${r.id}`,'visibility',showTraff?'visible':'none'); } catch {} }); });
  }, [showTraff, mapReady]);
  useEffect(() => {
    if (!mapReady||!mapRef.current) return;
    AREA_POLYGONS.forEach(a=>{ ['arfill','arbord'].forEach(p=>{ try { if(mapRef.current.getLayer(`${p}-${a.id}`)) mapRef.current.setLayoutProperty(`${p}-${a.id}`,'visibility',showAreas?'visible':'none'); } catch {} }); });
  }, [showAreas, mapReady]);

  // Fly to selected city
  useEffect(() => {
    if (!mapReady||!mapRef.current||!selectedCity) return;
    const city=typeof selectedCity==='object'?selectedCity:VIETNAM_CITIES.find(c=>c.name===selectedCity);
    if (!city) return;
    setPanel({ type:'city', data:city });
    mapRef.current.flyTo({ center:[city.lng,city.lat], zoom:11, pitch:is3D?55:30, bearing:-10, duration:1800 });
  }, [selectedCity, mapReady]); // eslint-disable-line

  const changeStyle = useCallback((key) => {
    setStyleKey(key);
    if (!mapRef.current) return;
    mapRef.current.setStyle(MAP_STYLES[key]);
    mapRef.current.once('styledata', () => setTimeout(() => { try { if(mapRef.current) addAllLayers(mapRef.current, activeLayer); } catch {} }, 700));
  }, [activeLayer, addAllLayers]);

  const toggleNight = () => {
    const next = !isNight;
    setIsNight(next);
    changeStyle(next ? 'night' : 'dark');
  };
  const toggle3D = () => {
    setIs3D(v=>{ const n=!v; if(mapRef.current) mapRef.current.easeTo({ pitch:n?55:0, bearing:n?-15:0, duration:900 }); return n; });
  };
  const resetView = () => {
    setIs3D(false); setPanel({ type:null, data:null });
    if (mapRef.current) mapRef.current.flyTo({ center:[107.5,16.0], zoom:5.5, pitch:0, bearing:0, duration:1500 });
  };

  const meta = LAYER_META[activeLayer]||LAYER_META.carbon;

  if (mapError) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden p-4" style={{background:'radial-gradient(ellipse at center,#0d2e14,#020b05)',border:'1px solid #00ff8822'}}>
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg font-mono text-xs" style={{background:'#0a1f0ecc',border:'1px solid #00ff8833',color:'#00ff88'}}>🇻🇳 VIETNAM MAP — OFFLINE</div>
        {VIETNAM_CITIES.map(city => {
          const l=((city.lng-102)/8.5)*100, t=(1-((city.lat-8)/15))*100, color=riskColor(layerValue(city,activeLayer));
          return <button key={city.id} title={city.name} onClick={()=>{onCitySelect&&onCitySelect(city);setPanel({type:'city',data:city});}} style={{position:'absolute',left:`${l}%`,top:`${t}%`,transform:'translate(-50%,-50%)',width:16,height:16,borderRadius:'50%',background:color,boxShadow:`0 0 12px ${color}`,border:'2px solid #ffffff88',cursor:'pointer'}}/>;
        })}
        {panel.type==='city'&&<CityPanel city={panel.data} factories={FACTORIES} onClose={closePanel}/>}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{border:'1px solid #00ff8822'}}>
      <div ref={mapContainer} className="w-full h-full" style={{minHeight:420}}/>

      {/* Top-left info */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <div className="px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-2" style={{background:'#060f08ee',border:'1px solid #00ff8833',color:'#00ff88',backdropFilter:'blur(8px)'}}>
          <Globe size={12}/> 🇻🇳 VIETNAM AI MAP {isNight?'🌙':'☀️'}
        </div>
        {hoveredCity&&<div className="px-3 py-1 rounded-lg font-mono text-xs" style={{background:'#0a1f0eee',border:'1px solid #00e5ff44',color:'#00e5ff',backdropFilter:'blur(8px)'}}>📍 {hoveredCity}</div>}
      </div>

      {/* Top-center controls */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-1.5 items-center">
        <div className="px-3 py-1 rounded-lg font-mono text-xs flex items-center gap-1.5" style={{background:'#060f08ee',border:`1px solid ${meta.color}44`,color:meta.color,backdropFilter:'blur(8px)'}}>
          <Layers size={11}/> {meta.icon} {meta.label.toUpperCase()}
        </div>
        {/* Style buttons */}
        <div className="flex gap-0.5 p-0.5 rounded-lg" style={{background:'#060f08ee',border:'1px solid #00ff8822',backdropFilter:'blur(8px)'}}>
          {Object.keys(MAP_STYLES).map(k=>(
            <button key={k} onClick={()=>changeStyle(k)} className="px-2 py-0.5 rounded text-xs font-mono capitalize transition-all"
              style={{background:styleKey===k?'#00ff8822':'transparent',color:styleKey===k?'#00ff88':'#4caf50',border:styleKey===k?'1px solid #00ff8844':'1px solid transparent'}}>{k}</button>
          ))}
        </div>
        {/* Toggle row */}
        <div className="flex gap-0.5">
          {[
            [toggleNight, isNight, '#7c4dff', isNight?<Moon size={9}/>:<Sun size={9}/>, isNight?'Night':'Day'],
            [toggle3D, is3D, '#e040fb', <Globe size={9}/>, '3D'],
            [()=>setShowHeat(v=>!v), showHeat, '#ff6d00', <Eye size={9}/>, 'Heat'],
            [()=>setShowFact(v=>!v), showFact, '#ef5350', <Factory size={9}/>, 'Industry'],
            [()=>setShowRen(v=>!v), showRen, '#ffb300', <Zap size={9}/>, 'Renewable'],
            [()=>setShowTraff(v=>!v), showTraff, '#ffb300', <Car size={9}/>, 'Traffic'],
            [()=>setShowAreas(v=>!v), showAreas, '#00e5ff', <MapPin size={9}/>, 'Areas'],
            [resetView, false, '#00ff88', <RotateCcw size={9}/>, '↺'],
          ].map(([fn,active,bg,icon,lbl])=>(
            <button key={lbl} onClick={fn} className="px-1.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all" style={{background:active?`${bg}22`:'#060f08ee',color:active?bg:'#81c784',border:`1px solid ${active?bg+'55':'#00ff8822'}`,backdropFilter:'blur(8px)',fontSize:9}}>
              {icon} {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* City list */}
      <div className="absolute bottom-3 right-14 z-10" style={{maxHeight:220,overflowY:'auto'}}>
        <div className="p-1.5 rounded-xl flex flex-col gap-0.5" style={{background:'#060f08ee',border:'1px solid #00ff8822',backdropFilter:'blur(8px)'}}>
          <div style={{fontSize:8,color:'#4caf50',fontFamily:'monospace',letterSpacing:'0.1em',marginBottom:2}}>CITIES</div>
          {VIETNAM_CITIES.map(city=>{
            const isSel=selectedCity&&(selectedCity===city.name||selectedCity?.name===city.name||selectedCity?.id===city.id);
            const color=riskColor(layerValue(city,activeLayer));
            return(<button key={city.id} onClick={()=>{onCitySelect&&onCitySelect(city);setPanel({type:'city',data:city});}} className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-left transition-all" style={{background:isSel?`${color}22`:'transparent',color:isSel?color:'#81c784',border:isSel?`1px solid ${color}44`:'1px solid transparent'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:color,boxShadow:`0 0 4px ${color}`,flexShrink:0}}/>
              <span style={{fontSize:9,fontFamily:'monospace'}}>{city.name.length>14?city.name.slice(0,13)+'…':city.name}</span>
            </button>);
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="p-2 rounded-xl" style={{background:'#060f08ee',border:'1px solid #00ff8822',backdropFilter:'blur(8px)'}}>
          <div style={{fontSize:8,color:'#4caf50',fontFamily:'monospace',marginBottom:4}}>{meta.icon} {meta.label.toUpperCase()}</div>
          <div className="w-20 h-1.5 rounded-full mb-1" style={{background:'linear-gradient(90deg,#00ff88,#ffb300,#ff6d00,#ff1744)'}}/>
          <div className="flex justify-between mb-2">{[['LOW','#00ff88'],['MED','#ffb300'],['HIGH','#ff6d00'],['CRIT','#ff1744']].map(([l,c])=><div key={l} className="flex items-center gap-0.5"><div style={{width:5,height:5,borderRadius:'50%',background:c}}/><span style={{fontSize:7,color:c,fontFamily:'monospace'}}>{l}</span></div>)}</div>
          <div className="space-y-0.5 border-t pt-1" style={{borderColor:'#0d2e14'}}>
            {[['🟡 Highway/Ring','#ffb300'],['🔵 Expressway','#00e5ff'],['🏭 Factory/Plant','#ef5350'],['☀️ Solar Farm','#ffb300'],['💨 Wind Farm','#00ff88'],['🚦 Traffic Hotspot','#ff1744']].map(([l,c])=><div key={l} style={{fontSize:7,color:c,fontFamily:'monospace'}}>{l}</div>)}
          </div>
        </div>
      </div>

      {/* Panels */}
      {panel.type==='city'    && <CityPanel      city={panel.data}    factories={FACTORIES} onClose={closePanel}/>}
      {panel.type==='factory' && <FactoryPanel   item={panel.data}    onClose={closePanel}/>}
      {panel.type==='renewable'&&<RenewablePanel item={panel.data}    onClose={closePanel}/>}
      {panel.type==='traffic' && <TrafficPanel   item={panel.data}    onClose={closePanel}/>}

      {/* Loading */}
      {!mapReady&&!mapError&&(
        <div className="absolute inset-0 flex items-center justify-center z-20" style={{background:'radial-gradient(ellipse at center,#0d2e1477,#020b05aa)'}}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3" style={{borderColor:'#00ff8833',borderTopColor:'#00ff88'}}/>
            <div className="font-mono text-xs" style={{color:'#00ff88'}}>LOADING MAP · FACTORIES · RENEWABLES · ROUTES</div>
            <div className="font-mono text-xs mt-1" style={{color:'#4caf50'}}>Traffic Hotspots · Area Polygons · Vietnam 🇻🇳</div>
          </div>
        </div>
      )}
    </div>
  );
}
