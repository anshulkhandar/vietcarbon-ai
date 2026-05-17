const YEARLY_NATIONAL_DATA = [
  { year: 2021, totalCO2: 162.5, vehicleCO2: 47.2, factoryCO2: 58.6, electricityCO2: 24.1, residentialCO2: 16.8, industrialCO2: 10.3, agricultureCO2: 5.5, population: 98.2, totalVehicles: 6.1, evVehicles: 0.12, trafficIndex: 72, fuel: 18.1, floods: 24, storms: 6, heatwaves: 5, droughts: 3, landslides: 7, loss: 1.32, soilFertility: 81, soilMoisture: 69, nitrogen: 82, landDegradation: 9, cropScore: 72, solar: 11200, wind: 3900, hydro: 28400, biomass: 2500, evStations: 2100, renewablePercent: 19, aqi: 61, pm25: 32, pm10: 48, co: 0.8, no2: 18, so2: 14 },
  { year: 2022, totalCO2: 168.7, vehicleCO2: 49.8, factoryCO2: 61.1, electricityCO2: 24.7, residentialCO2: 17.6, industrialCO2: 10.6, agricultureCO2: 5.9, population: 99.1, totalVehicles: 6.4, evVehicles: 0.21, trafficIndex: 74, fuel: 18.9, floods: 27, storms: 8, heatwaves: 7, droughts: 4, landslides: 9, loss: 1.68, soilFertility: 80, soilMoisture: 67, nitrogen: 80, landDegradation: 10, cropScore: 73, solar: 13800, wind: 4600, hydro: 30100, biomass: 2900, evStations: 3600, renewablePercent: 21, aqi: 63, pm25: 33, pm10: 49, co: 0.8, no2: 18, so2: 14 },
  { year: 2023, totalCO2: 173.4, vehicleCO2: 51.6, factoryCO2: 63.3, electricityCO2: 25.5, residentialCO2: 18.1, industrialCO2: 10.9, agricultureCO2: 6.0, population: 100.0, totalVehicles: 6.7, evVehicles: 0.39, trafficIndex: 76, fuel: 19.6, floods: 32, storms: 9, heatwaves: 8, droughts: 6, landslides: 11, loss: 2.15, soilFertility: 79, soilMoisture: 65, nitrogen: 78, landDegradation: 11, cropScore: 74, solar: 15900, wind: 5300, hydro: 32700, biomass: 3400, evStations: 5100, renewablePercent: 24, aqi: 65, pm25: 35, pm10: 51, co: 0.9, no2: 19, so2: 13 },
  { year: 2024, totalCO2: 176.8, vehicleCO2: 52.9, factoryCO2: 64.7, electricityCO2: 26.1, residentialCO2: 18.3, industrialCO2: 11.0, agricultureCO2: 6.1, population: 100.8, totalVehicles: 7.0, evVehicles: 0.64, trafficIndex: 77, fuel: 20.2, floods: 29, storms: 7, heatwaves: 10, droughts: 5, landslides: 10, loss: 1.92, soilFertility: 78, soilMoisture: 63, nitrogen: 76, landDegradation: 13, cropScore: 75, solar: 17200, wind: 5900, hydro: 34500, biomass: 3800, evStations: 6900, renewablePercent: 26, aqi: 67, pm25: 37, pm10: 43, co: 0.8, no2: 17, so2: 12 },
  { year: 2025, totalCO2: 179.6, vehicleCO2: 54.3, factoryCO2: 66.2, electricityCO2: 26.8, residentialCO2: 18.7, industrialCO2: 11.2, agricultureCO2: 6.4, population: 101.6, totalVehicles: 7.2, evVehicles: 0.91, trafficIndex: 78, fuel: 20.9, floods: 28, storms: 7, heatwaves: 12, droughts: 4, landslides: 9, loss: 1.85, soilFertility: 78, soilMoisture: 62, nitrogen: 76, landDegradation: 14, cropScore: 76, solar: 18750, wind: 6240, hydro: 36180, biomass: 4310, evStations: 8750, renewablePercent: 28.7, aqi: 68, pm25: 28, pm10: 45, co: 0.7, no2: 16, so2: 12 }
];

const CITY_YEARLY_DATA = [
  { name:'Hanoi', lat:21.0285, lng:105.8542, region:'Red River Delta', smartScore:78.5, yearly:[
    {year:2021,population:8246000,co2:31.8,aqi:138,traffic:82,vehicles:1170000,factories:1450,renewable:12,floodRisk:62,soil:77},
    {year:2022,population:8360000,co2:33.2,aqi:145,traffic:85,vehicles:1240000,factories:1510,renewable:14,floodRisk:64,soil:76},
    {year:2023,population:8490000,co2:34.7,aqi:151,traffic:87,vehicles:1315000,factories:1580,renewable:16,floodRisk:66,soil:75},
    {year:2024,population:8630000,co2:36.0,aqi:156,traffic:88,vehicles:1390000,factories:1640,renewable:18,floodRisk:68,soil:74},
    {year:2025,population:8787300,co2:37.4,aqi:162,traffic:89,vehicles:1470000,factories:1705,renewable:21,floodRisk:70,soil:73}]},
  { name:'Ho Chi Minh City', lat:10.8231, lng:106.6297, region:'Southeast', smartScore:82.7, yearly:[
    {year:2021,population:9020000,co2:39.5,aqi:130,traffic:85,vehicles:1600000,factories:1780,renewable:16,floodRisk:78,soil:70},
    {year:2022,population:9140000,co2:41.8,aqi:136,traffic:87,vehicles:1700000,factories:1850,renewable:18,floodRisk:81,soil:69},
    {year:2023,population:9280000,co2:43.7,aqi:141,traffic:89,vehicles:1810000,factories:1930,renewable:20,floodRisk:83,soil:68},
    {year:2024,population:9390000,co2:45.9,aqi:149,traffic:91,vehicles:1930000,factories:2010,renewable:23,floodRisk:86,soil:67},
    {year:2025,population:9487200,co2:47.6,aqi:156,traffic:92,vehicles:2050000,factories:2090,renewable:25,floodRisk:88,soil:66}]},
  { name:'Da Nang', lat:16.0544, lng:108.2022, region:'South Central Coast', smartScore:74.6, yearly:[
    {year:2021,population:1114000,co2:7.1,aqi:58,traffic:65,vehicles:385000,factories:410,renewable:25,floodRisk:68,soil:80},
    {year:2022,population:1132000,co2:7.6,aqi:60,traffic:68,vehicles:410000,factories:440,renewable:28,floodRisk:70,soil:79},
    {year:2023,population:1150000,co2:8.0,aqi:64,traffic:72,vehicles:435000,factories:470,renewable:32,floodRisk:72,soil:78},
    {year:2024,population:1170000,co2:8.4,aqi:67,traffic:76,vehicles:470000,factories:500,renewable:35,floodRisk:74,soil:78},
    {year:2025,population:1194300,co2:8.9,aqi:74,traffic:82,vehicles:510000,factories:535,renewable:38,floodRisk:76,soil:77}]},
  { name:'Hai Phong', lat:20.8449, lng:106.6881, region:'Red River Delta', smartScore:73.1, yearly:[
    {year:2021,population:2010000,co2:17.2,aqi:122,traffic:70,vehicles:520000,factories:1210,renewable:10,floodRisk:72,soil:71},
    {year:2022,population:2030000,co2:18.1,aqi:126,traffic:73,vehicles:555000,factories:1280,renewable:12,floodRisk:74,soil:70},
    {year:2023,population:2050000,co2:19.4,aqi:129,traffic:76,vehicles:590000,factories:1350,renewable:13,floodRisk:76,soil:69},
    {year:2024,population:2070000,co2:20.6,aqi:134,traffic:80,vehicles:630000,factories:1420,renewable:15,floodRisk:78,soil:68},
    {year:2025,population:2095300,co2:21.8,aqi:140,traffic:85,vehicles:675000,factories:1490,renewable:17,floodRisk:80,soil:67}]},
  { name:'Can Tho', lat:10.0452, lng:105.7469, region:'Mekong Delta', smartScore:71.2, yearly:[
    {year:2021,population:1250000,co2:6.0,aqi:53,traffic:50,vehicles:310000,factories:330,renewable:32,floodRisk:88,soil:82},
    {year:2022,population:1260000,co2:6.3,aqi:55,traffic:53,vehicles:330000,factories:350,renewable:36,floodRisk:90,soil:81},
    {year:2023,population:1270000,co2:6.7,aqi:58,traffic:56,vehicles:350000,factories:370,renewable:40,floodRisk:92,soil:80},
    {year:2024,population:1280000,co2:7.1,aqi:60,traffic:59,vehicles:370000,factories:395,renewable:43,floodRisk:94,soil:79},
    {year:2025,population:1297300,co2:7.5,aqi:63,traffic:62,vehicles:395000,factories:420,renewable:46,floodRisk:96,soil:78}]}
];

const HOTSPOTS_2025 = [
  { area:'Dinh Vu Industrial Area', city:'Hai Phong', co2:8.75, pollutionScore:94, reason:'Heavy industry + logistics' },
  { area:'Cat Lai Port Area', city:'Ho Chi Minh City', co2:7.92, pollutionScore:95, reason:'Port traffic + diesel trucks' },
  { area:'Phu My Industrial Zone', city:'Ba Ria-Vung Tau', co2:6.35, pollutionScore:90, reason:'Steel, power and industry' },
  { area:'Thang Long Industrial Park', city:'Hanoi', co2:5.88, pollutionScore:82, reason:'Factory cluster + traffic' },
  { area:'Hoa Khanh Industrial Zone', city:'Da Nang', co2:4.92, pollutionScore:75, reason:'Factory emissions' }
];

const CROWDED_AREAS_2025 = [
  { area:'District 1', city:'Ho Chi Minh City', density:28750, reason:'Business, tourism, offices' },
  { area:'Ba Dinh', city:'Hanoi', density:24600, reason:'Government + offices' },
  { area:'Hai Ba Trung', city:'Hanoi', density:23120, reason:'Commercial + education' },
  { area:'Cau Giay', city:'Hanoi', density:21980, reason:'IT offices + universities' },
  { area:'Ngu Hanh Son', city:'Da Nang', density:18450, reason:'Tourism + coastal growth' }
];

const DATA_SOURCES = ['OpenWeather API','WAQI / IQAir','OpenStreetMap','Sentinel Hub','NASA EarthData','World Bank','Vietnam open datasets','IRENA','Copernicus Climate Data Store'];

const VIETNAM_CITIES = CITY_YEARLY_DATA.map(c => {
  const y = c.yearly[c.yearly.length - 1];
  return { id: c.name.toLowerCase().replaceAll(' ','-'), name:c.name, lat:c.lat, lng:c.lng, population:y.population, emissionMT:y.co2, carbonEmission: Math.min(100, Math.round(y.co2*2)), aqi:y.aqi, trafficDensity:y.traffic, factories:y.factories, floodRisk:y.floodRisk, renewablePercent:y.renewable, solarAvailability: y.renewable + 40, climateRisk: Math.round((y.floodRisk + y.aqi/2 + y.traffic/2)/2), region:c.region, smartScore:c.smartScore, yearlyData:Object.fromEntries(c.yearly.map(v=>[v.year,{emission:v.co2,aqi:v.aqi,renewable:v.renewable}])) };
});
const VIETNAM_STATS = { totalCO2:179.6, renewableShare:28.7, populationTotal:101600000, urbanizationRate:39.5, targetReduction:15, evVehicles:910300 };

module.exports = { YEARLY_NATIONAL_DATA, CITY_YEARLY_DATA, HOTSPOTS_2025, CROWDED_AREAS_2025, DATA_SOURCES, VIETNAM_CITIES, VIETNAM_STATS };
