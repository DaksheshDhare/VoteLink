export interface User {
  id: string;
  email: string;
  mobile: string;
  role?: 'voter' | 'admin'; // New: User role for access control
  voterID?: string; // New: Voter ID number from verification
  firebaseUID?: string; // New: Firebase phone auth UID
  voterIdUploaded: boolean;
  disabilityCertificateUploaded: boolean;
  isDisabledVoter: boolean;
  hasVoted: boolean;
  votedAt?: Date;
  votedElections?: Array<{ electionId: string; votedAt: Date | string }>; // Track which elections user has voted in
  // Region and voting details
  selectedRegion?: VotingRegion;
  constituency?: string;
  currentElectionId?: string; // Current active election ID
  // Blockchain fields
  blockchainRegistered?: boolean;
  registrationTxHash?: string;
  voteTransactionHash?: string;
  voteBlockNumber?: number;
  voteBlockHash?: string;
}

export interface VotingRegion {
  id: string;
  name: string;
  state: string;
  district: string;
  constituency: string;
  type: 'lok-sabha' | 'vidhan-sabha' | 'municipal' | 'panchayat';
  totalVoters: number;
  activeElections: ElectionInfo[];
}

export interface ElectionInfo {
  id: string;
  name: string;
  type: 'lok-sabha' | 'vidhan-sabha' | 'municipal' | 'panchayat';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  candidates: Candidate[];
}

export interface Candidate {
  id: string;
  name: string;
  party: Party;
  photo: string;
  age: number;
  education: string;
  criminalCases?: number;
  assets?: string;
  experience: string;
}

export interface Party {
  id: string;
  name: string;
  logo: string;
  description: string;
  color: string;
}

export interface Vote {
  id: string;
  userId: string;
  partyId: string;
  timestamp: Date;
}

export interface AuthStep {
  current: 'login' | 'registration' | 'otp' | 'face-capture' | 'voter-id' | 'voter-id-face-verify' | 'disability-cert' | 'instructions' | 'region-selection' | 'voting' | 'complete' | 'admin-dashboard' | 'admin-hosting';
}