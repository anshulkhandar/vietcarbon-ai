export const CITY_CONFIG = {
  'Ho Chi Minh City': {
    id: 'hcmc',
    center: [10.8231, 106.6297],
    zoom: 12,
    districts: ['District 1', 'District 3', 'Thu Duc', 'Cat Lai', 'Binh Thanh'],
    baseHotspots: [
      { id: 1, name: 'District 1 (Dong Khoi)', lat: 10.7769, lng: 106.7009, severity: 'red', radius: 500, type: 'commercial' },
      { id: 2, name: 'Cat Lai Port Area', lat: 10.7627, lng: 106.7658, severity: 'purple', radius: 800, type: 'logistics' },
      { id: 3, name: 'Tan Son Nhat Airport Ring', lat: 10.8172, lng: 106.6645, severity: 'orange', radius: 600, type: 'transit' },
      { id: 4, name: 'Binh Thanh Intersection', lat: 10.8000, lng: 106.6987, severity: 'yellow', radius: 400, type: 'residential' }
    ],
    overlays: {
      metro: true,
      bus: true,
      freightCorridors: true
    }
  },
  'Hanoi': {
    id: 'hanoi',
    center: [21.0285, 105.8542],
    zoom: 12,
    districts: ['Hoan Kiem', 'Ba Dinh', 'Cau Giay', 'Dong Da', 'Ha Dong'],
    baseHotspots: [
      { id: 1, name: 'Hoan Kiem Center', lat: 21.0285, lng: 105.8542, severity: 'orange', radius: 500, type: 'tourism' },
      { id: 2, name: 'Cau Giay IT Cluster', lat: 21.0333, lng: 105.7833, severity: 'red', radius: 600, type: 'tech' },
      { id: 3, name: 'Ring Road 3 Highway', lat: 20.9937, lng: 105.8056, severity: 'purple', radius: 800, type: 'transit' },
      { id: 4, name: 'Ba Dinh Square Area', lat: 21.0367, lng: 105.8347, severity: 'green', radius: 300, type: 'government' }
    ],
    overlays: {
      metro: true,
      bus: true,
      freightCorridors: false
    }
  },
  'Da Nang': {
    id: 'danang',
    center: [16.0544, 108.2022],
    zoom: 13,
    districts: ['Hai Chau', 'Son Tra', 'Lien Chieu'],
    baseHotspots: [
      { id: 1, name: 'Han River Bridge', lat: 16.0719, lng: 108.2241, severity: 'orange', radius: 400, type: 'transit' },
      { id: 2, name: 'Lien Chieu Industrial Corridor', lat: 16.1065, lng: 108.1542, severity: 'red', radius: 600, type: 'industrial' },
      { id: 3, name: 'My Khe Beach Front', lat: 16.0598, lng: 108.2465, severity: 'yellow', radius: 400, type: 'tourism' }
    ],
    overlays: {
      metro: false,
      bus: true,
      freightCorridors: true
    }
  },
  'Hai Phong': {
    id: 'haiphong',
    center: [20.8449, 106.6881],
    zoom: 13,
    districts: ['Hong Bang', 'Ngo Quyen', 'Hai An'],
    baseHotspots: [
      { id: 1, name: 'Dinh Vu Industrial Zone', lat: 20.8400, lng: 106.7400, severity: 'purple', radius: 900, type: 'industrial' },
      { id: 2, name: 'City Harbor Access', lat: 20.8625, lng: 106.7012, severity: 'red', radius: 600, type: 'logistics' }
    ],
    overlays: {
      metro: false,
      bus: true,
      freightCorridors: true
    }
  },
  'Can Tho': {
    id: 'cantho',
    center: [10.0452, 105.7469],
    zoom: 13,
    districts: ['Ninh Kieu', 'Binh Thuy', 'Cai Rang'],
    baseHotspots: [
      { id: 1, name: 'Ninh Kieu Wharf', lat: 10.0347, lng: 105.7884, severity: 'orange', radius: 450, type: 'tourism' },
      { id: 2, name: 'Tra Noc Industrial Park', lat: 10.1100, lng: 105.7100, severity: 'red', radius: 700, type: 'industrial' }
    ],
    overlays: {
      metro: false,
      bus: true,
      freightCorridors: false
    }
  }
};

export const getCityList = () => Object.keys(CITY_CONFIG);
export const getCityData = (cityName) => CITY_CONFIG[cityName] || CITY_CONFIG['Ho Chi Minh City'];
