import { VotingRegion, ElectionInfo } from '../types';

/**
 * IMPORTANT: Demo/Hard-coded regions have been completely removed.
 * All voting regions must now come from the admin-managed database.
 * 
 * The frontend will:
 * 1. Fetch elections from the backend database
 * 2. Display ONLY active elections created by the admin
 * 3. Show "No active elections" if no elections are configured
 * 4. NOT display any fallback or mock data
 */

// Empty by design - all regions must be created by admin and fetched from database
export const indianRegions: VotingRegion[] = [];

export const getRegionsByState = (state: string): VotingRegion[] => {
  return indianRegions.filter(region => region.state === state);
};

export const getRegionsByDistrict = (state: string, district: string): VotingRegion[] => {
  return indianRegions.filter(region => 
    region.state === state && region.district === district
  );
};

export const searchRegions = (searchTerm: string): VotingRegion[] => {
  const term = searchTerm.toLowerCase();
  return indianRegions.filter(region =>
    region.name.toLowerCase().includes(term) ||
    region.constituency.toLowerCase().includes(term) ||
    region.district.toLowerCase().includes(term) ||
    region.state.toLowerCase().includes(term)
  );
};

export const getAllStates = (): string[] => {
  // Returns empty array - all states must be fetched from admin-managed elections
  return [];
};

export const getDistrictsForState = (state: string): string[] => {
  // Returns empty array - all districts must be fetched from admin-managed elections
  return [];
};

export const getDistrictsForState = (state: string): string[] => {
  const districts = indianRegions
    .filter(region => region.state === state)
    .map(region => region.district);
  return [...new Set(districts)].sort();
};