/**
 * Service dedicated to retrieving raw map/node data from OpenStreetMap Overpass API.
 * Future expansions include downloading specific geo-regions for vector processing.
 */
import axios from 'axios';

export const osmService = {
  /**
   * Retrieves amenities or transport nodes around specific coordinates.
   * Shell implementation for Phase 2 readiness.
   */
  async fetchNodesAround(lat, lng, radiusMeters = 1000, type = 'bus_stop') {
    try {
      // OpenStreetMap Overpass Query structure skeleton
      // const query = `[out:json];node["highway"="${type}"](around:${radiusMeters},${lat},${lng});out;`;
      
      // Simulating realistic async structure
      await new Promise(r => setTimeout(r, 200));
      
      // Generic mock node data for initialization
      return [
        { id: Math.random(), lat: lat + 0.002, lng: lng + 0.001, tags: { name: 'Mock Station A' } },
        { id: Math.random(), lat: lat - 0.001, lng: lng - 0.002, tags: { name: 'Mock Station B' } }
      ];
    } catch (error) {
      console.error('OSM Service Error:', error);
      return [];
    }
  }
};
