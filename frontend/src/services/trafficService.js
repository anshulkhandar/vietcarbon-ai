/**
 * Traffic Intelligence Service.
 * Calls backend /api/traffic/analyze which proxies TomTom + Gemini
 * and returns real, AI-enriched hotspot intelligence.
 *
 * NO local fallback simulation. If backend is down, we surface the error honestly.
 */
import api from '../utils/api';
import { getCityData } from './cityConfig';

export const trafficService = {
  /**
   * Fetches live-analyzed hotspot intelligence from the backend.
   * Throws on failure — the UI handles error states directly.
   */
  async getComprehensiveHotspots(cityName) {
    const cityConfig = getCityData(cityName);

    const response = await api.post('/traffic/analyze', {
      hotspots: cityConfig.baseHotspots,
      cityName: cityName
    });

    return response.data;
  }
};
