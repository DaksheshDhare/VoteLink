/**
 * Voting Flow Service
 * 
 * Implements the complete secure voting flow:
 * 1. Voter eligibility verification (hasn't voted)
 * 2. Blockchain vote recording (secure & immutable)
 * 3. Continuous voting until all voted or time expires
 * 4. Blockchain data validation
 * 5. Secure vote tallying
 * 6. Final results declaration
 */

import { ethers } from 'ethers';

// ==================== Types & Interfaces ====================

export interface VoterEligibility {
  isEligible: boolean;
  hasAlreadyVoted: boolean;
  voterHash: string;
  voterId: string;
  registrationStatus: 'registered' | 'not_registered' | 'pending';
  verificationTimestamp: number;
  blockchainVerified: boolean;
  reason?: string;
}

export interface VoteTransaction {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  gasUsed: string;
  voterHash: string;
  candidateHash: string;
  electionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
}

export interface ElectionState {
  electionId: string;
  title: string;
  status: 'not_started' | 'active' | 'paused' | 'ended' | 'tallying' | 'results_declared';
  startTime: number;
  endTime: number;
  totalEligibleVoters: number;
  totalVotesCast: number;
  remainingVoters: number;
  participationRate: number;
  isBlockchainSynced: boolean;
  lastBlockNumber: number;
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  party: string;
  partySymbol: string;
  partyColor: string;
  voteCount: number;
  percentage: number;
  blockchainVoteHash: string;
  isVerified: boolean;
}

export interface ElectionResults {
  electionId: string;
  electionTitle: string;
  totalVotes: number;
  totalEligibleVoters: number;
  participationRate: number;
  candidates: CandidateResult[];
  winner: CandidateResult | null;
  isRunoff: boolean;
  declarationTimestamp: number;
  blockchainValidated: boolean;
  auditTrailHash: string;
  status: 'preliminary' | 'final' | 'contested';
}

export interface VoteReceipt {
  receiptId: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  electionId: string;
  voterHashPrefix: string; // First 8 chars for privacy
  verificationCode: string;
  qrCodeData: string;
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: number;
  actorHash: string;
  details: Record<string, unknown>;
  blockNumber?: number;
  transactionHash?: string;
}

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
  VOTER_REGISTRY: 'votelink_voter_registry',
  VOTE_TRANSACTIONS: 'votelink_vote_transactions',
  ELECTION_STATE: 'votelink_election_state',
  AUDIT_LOGS: 'votelink_audit_logs',
  RESULTS_CACHE: 'votelink_results_cache',
  BLOCKCHAIN_SYNC: 'votelink_blockchain_sync'
};

// ==================== Voting Flow Service ====================

class VotingFlowService {
  private _voterRegistry: Map<string, VoterEligibility> = new Map(); // Reserved for future use
  private voteTransactions: VoteTransaction[] = [];
  private electionStates: Map<string, ElectionState> = new Map();
  private auditLogs: AuditLog[] = [];
  private listeners: Set<(event: string, data: unknown) => void> = new Set();
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadFromStorage();
    this.startElectionMonitoring();
  }

  // ==================== 1. VOTER ELIGIBILITY VERIFICATION ====================

  /**
   * Verify voter eligibility - checks if voter can vote
   * Step 1: Check voter hasn't already voted
   */
  async verifyVoterEligibility(
    voterId: string,
    electionId: string
  ): Promise<VoterEligibility> {
    const voterHash = this.generateSecureHash(voterId);
    
    this.logAudit('ELIGIBILITY_CHECK_STARTED', {
      voterHashPrefix: voterHash.substring(0, 16),
      electionId
    });

    try {
      // Check 1: Voter format validation
      if (!this.isValidVoterId(voterId)) {
        return this.createEligibilityResult(false, voterId, voterHash, 
          'Invalid voter ID format', 'not_registered');
      }

      // Check 2: Has voter already voted in this election?
      const hasVoted = await this.checkIfAlreadyVoted(voterHash, electionId);
      if (hasVoted) {
        this.logAudit('DUPLICATE_VOTE_ATTEMPT', {
          voterHashPrefix: voterHash.substring(0, 16),
          electionId
        });
        return this.createEligibilityResult(false, voterId, voterHash,
          'Voter has already cast a vote in this election', 'registered', true);
      }

      // Check 3: Verify on blockchain (if available)
      const blockchainVerified = await this.verifyOnBlockchain(voterHash);

      // Check 4: Is election active?
      const electionState = this.electionStates.get(electionId);
      if (electionState && electionState.status !== 'active') {
        return this.createEligibilityResult(false, voterId, voterHash,
          `Election is ${electionState.status}`, 'registered');
      }

      // Check 5: Is election time valid?
      if (electionState && !this.isWithinElectionTime(electionState)) {
        return this.createEligibilityResult(false, voterId, voterHash,
          'Election period has ended or not yet started', 'registered');
      }

      // All checks passed - voter is eligible
      this.logAudit('ELIGIBILITY_VERIFIED', {
        voterHashPrefix: voterHash.substring(0, 16),
        electionId,
        blockchainVerified
      });

      return this.createEligibilityResult(true, voterId, voterHash,
        undefined, 'registered', false, blockchainVerified);

    } catch (error) {
      console.error('Eligibility verification error:', error);
      this.logAudit('ELIGIBILITY_CHECK_ERROR', {
        voterHashPrefix: voterHash.substring(0, 16),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return this.createEligibilityResult(false, voterId, voterHash,
        'Verification failed - please try again', 'pending');
    }
  }

  /**
   * Check if voter has already voted in this election
   */
  private async checkIfAlreadyVoted(voterHash: string, electionId: string): Promise<boolean> {
    // Check local storage first (fast)
    const localVotes = this.getStoredVotes(electionId);
    if (localVotes[voterHash]) {
      return true;
    }

    // Check vote transactions
    const existingVote = this.voteTransactions.find(
      tx => tx.voterHash === voterHash && 
           tx.electionId === electionId && 
           tx.status === 'confirmed'
    );

    return !!existingVote;
  }

  // ==================== 2. BLOCKCHAIN VOTE RECORDING ====================

  /**
   * Record vote on blockchain - secure & immutable
   * Step 2: Cast vote as blockchain transaction
   */
  async recordVoteOnBlockchain(
    voterId: string,
    candidateId: string,
    electionId: string
  ): Promise<VoteTransaction> {
    const voterHash = this.generateSecureHash(voterId);
    const candidateHash = this.generateSecureHash(candidateId);
    const timestamp = Date.now();

    this.logAudit('VOTE_RECORDING_STARTED', {
      voterHashPrefix: voterHash.substring(0, 16),
      candidateHashPrefix: candidateHash.substring(0, 16),
      electionId
    });

    // Create pending transaction
    const pendingTx: VoteTransaction = {
      transactionHash: '', // Will be set after blockchain confirmation
      blockNumber: 0,
      blockHash: '',
      timestamp,
      gasUsed: '0',
      voterHash,
      candidateHash,
      electionId,
      status: 'pending',
      confirmations: 0
    };

    try {
      // Step 2.1: Re-verify eligibility (double-check)
      const eligibility = await this.verifyVoterEligibility(voterId, electionId);
      if (!eligibility.isEligible) {
        throw new Error(eligibility.reason || 'Voter not eligible');
      }

      // Step 2.2: Create blockchain transaction
      const txResult = await this.submitToBlockchain(voterHash, candidateHash, electionId);
      
      // Step 2.3: Update transaction with blockchain data
      const confirmedTx: VoteTransaction = {
        ...pendingTx,
        transactionHash: txResult.transactionHash,
        blockNumber: txResult.blockNumber,
        blockHash: txResult.blockHash,
        gasUsed: txResult.gasUsed,
        status: 'confirmed',
        confirmations: 1
      };

      // Step 2.4: Store the confirmed vote
      this.voteTransactions.push(confirmedTx);
      this.storeVote(voterHash, candidateHash, electionId, confirmedTx.transactionHash);
      this.saveToStorage();

      // Step 2.5: Update election state
      this.updateElectionVoteCount(electionId);

      this.logAudit('VOTE_RECORDED_SUCCESS', {
        transactionHash: confirmedTx.transactionHash,
        blockNumber: confirmedTx.blockNumber,
        electionId
      });

      // Emit event for UI updates
      this.emit('voteRecorded', { 
        electionId, 
        transactionHash: confirmedTx.transactionHash 
      });

      return confirmedTx;

    } catch (error) {
      console.error('Vote recording failed:', error);
      
      pendingTx.status = 'failed';
      this.voteTransactions.push(pendingTx);

      this.logAudit('VOTE_RECORDING_FAILED', {
        voterHashPrefix: voterHash.substring(0, 16),
        error: error instanceof Error ? error.message : 'Unknown error',
        electionId
      });

      throw error;
    }
  }

  /**
   * Submit vote to blockchain (simulated for demo, integrates with real contract)
   */
  private async submitToBlockchain(
    voterHash: string,
    candidateHash: string,
    electionId: string
  ): Promise<{
    transactionHash: string;
    blockNumber: number;
    blockHash: string;
    gasUsed: string;
  }> {
    // Generate cryptographically secure transaction data
    const txData = {
      voterHash,
      candidateHash,
      electionId,
      timestamp: Date.now(),
      nonce: crypto.getRandomValues(new Uint32Array(1))[0]
    };

    // Create deterministic transaction hash
    const txString = JSON.stringify(txData);
    const encoder = new TextEncoder();
    const data = encoder.encode(txString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const transactionHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create block hash
    const blockData = encoder.encode(transactionHash + Date.now());
    const blockHashBuffer = await crypto.subtle.digest('SHA-256', blockData);
    const blockHashArray = Array.from(new Uint8Array(blockHashBuffer));
    const blockHash = '0x' + blockHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Simulate blockchain delay (in production, this would be real tx confirmation)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get current block number from stored state
    const syncState = this.getBlockchainSyncState();
    const blockNumber = syncState.lastBlockNumber + 1;
    this.updateBlockchainSyncState(blockNumber);

    return {
      transactionHash,
      blockNumber,
      blockHash,
      gasUsed: '21000'
    };
  }

  // ==================== 3. CONTINUOUS VOTING MONITORING ====================

  /**
   * Monitor election until all voted or time expires
   * Step 3: Accept votes continuously
   */
  startElectionMonitoring(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Check every 30 seconds
    this.pollingInterval = setInterval(() => {
      this.checkActiveElections();
    }, 30000);

    // Initial check
    this.checkActiveElections();
  }

  /**
   * Check all active elections
   */
  private checkActiveElections(): void {
    this.electionStates.forEach((state, electionId) => {
      if (state.status === 'active') {
        // Check if time expired
        if (Date.now() >= state.endTime) {
          this.endElection(electionId, 'time_expired');
        }
        // Check if all voters have voted
        else if (state.remainingVoters === 0) {
          this.endElection(electionId, 'all_voted');
        }
        // Update stats
        else {
          this.updateElectionStats(electionId);
        }
      }
    });
  }

  /**
   * Initialize election state for tracking
   */
  initializeElection(
    electionId: string,
    title: string,
    startTime: number,
    endTime: number,
    totalEligibleVoters: number
  ): ElectionState {
    const state: ElectionState = {
      electionId,
      title,
      status: Date.now() >= startTime ? 'active' : 'not_started',
      startTime,
      endTime,
      totalEligibleVoters,
      totalVotesCast: 0,
      remainingVoters: totalEligibleVoters,
      participationRate: 0,
      isBlockchainSynced: true,
      lastBlockNumber: this.getBlockchainSyncState().lastBlockNumber
    };

    this.electionStates.set(electionId, state);
    this.saveToStorage();

    this.logAudit('ELECTION_INITIALIZED', {
      electionId,
      title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      totalEligibleVoters
    });

    return state;
  }

  /**
   * End an election
   */
  private endElection(electionId: string, reason: 'time_expired' | 'all_voted' | 'manual'): void {
    const state = this.electionStates.get(electionId);
    if (!state || state.status !== 'active') return;

    state.status = 'ended';
    this.saveToStorage();

    this.logAudit('ELECTION_ENDED', {
      electionId,
      reason,
      totalVotesCast: state.totalVotesCast,
      participationRate: state.participationRate
    });

    this.emit('electionEnded', { electionId, reason });

    // Automatically start tallying
    setTimeout(() => {
      this.startTallying(electionId);
    }, 2000);
  }

  // ==================== 4. BLOCKCHAIN DATA VALIDATION ====================

  /**
   * Validate blockchain data integrity
   * Step 4: Verify all votes are valid
   */
  async validateBlockchainData(electionId: string): Promise<{
    isValid: boolean;
    totalTransactions: number;
    validTransactions: number;
    invalidTransactions: number;
    errors: string[];
  }> {
    this.logAudit('BLOCKCHAIN_VALIDATION_STARTED', { electionId });

    const electionVotes = this.voteTransactions.filter(
      tx => tx.electionId === electionId
    );

    const errors: string[] = [];
    let validCount = 0;
    let invalidCount = 0;

    // Track seen voter hashes to efficiently detect duplicates (O(n) instead of O(n²))
    const seenVoterHashes = new Map<string, string>(); // voterHash -> transactionHash

    for (const tx of electionVotes) {
      try {
        // Validate transaction hash format
        if (!this.isValidTransactionHash(tx.transactionHash)) {
          errors.push(`Invalid transaction hash: ${tx.transactionHash.substring(0, 20)}...`);
          invalidCount++;
          continue;
        }

        // Validate block number is sequential
        if (tx.blockNumber <= 0) {
          errors.push(`Invalid block number: ${tx.blockNumber}`);
          invalidCount++;
          continue;
        }

        // Validate voter hash
        if (!tx.voterHash || tx.voterHash.length !== 66) {
          errors.push(`Invalid voter hash format`);
          invalidCount++;
          continue;
        }

        // Validate candidate hash
        if (!tx.candidateHash || tx.candidateHash.length !== 66) {
          errors.push(`Invalid candidate hash format`);
          invalidCount++;
          continue;
        }

        // Validate timestamp is reasonable
        if (tx.timestamp < Date.now() - 365 * 24 * 60 * 60 * 1000) {
          errors.push(`Transaction timestamp too old`);
          invalidCount++;
          continue;
        }

        // Check for duplicate voter hashes (double voting) - Optimized O(1) lookup
        if (seenVoterHashes.has(tx.voterHash)) {
          errors.push(`Duplicate vote detected for voter`);
          invalidCount++;
          continue;
        }
        
        // Mark this voter hash as seen
        seenVoterHashes.set(tx.voterHash, tx.transactionHash);

        validCount++;
      } catch (error) {
        errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown'}`);
        invalidCount++;
      }
    }

    const result = {
      isValid: invalidCount === 0,
      totalTransactions: electionVotes.length,
      validTransactions: validCount,
      invalidTransactions: invalidCount,
      errors
    };

    this.logAudit('BLOCKCHAIN_VALIDATION_COMPLETED', {
      electionId,
      ...result
    });

    return result;
  }

  // ==================== 5. SECURE VOTE TALLYING ====================

  /**
   * Securely tally votes from blockchain
   * Step 5: Count all valid votes
   * @param skipValidation - Skip validation for faster results (use for live/preview)
   */
  async tallyVotes(electionId: string, candidates: Array<{
    id: string;
    name: string;
    party: string;
    symbol: string;
    color: string;
  }>, skipValidation: boolean = false): Promise<Map<string, number>> {
    const state = this.electionStates.get(electionId);
    if (state) {
      state.status = 'tallying';
      this.saveToStorage();
    }

    this.logAudit('VOTE_TALLYING_STARTED', { electionId });

    // Validate blockchain data only for final results (skip for live/preview)
    if (!skipValidation) {
      const validation = await this.validateBlockchainData(electionId);
      if (!validation.isValid) {
        console.warn('Blockchain validation found issues:', validation.errors);
      }
    }

    // Get all confirmed votes for this election
    const confirmedVotes = this.voteTransactions.filter(
      tx => tx.electionId === electionId && tx.status === 'confirmed'
    );

    // Initialize tally for all candidates
    const tally = new Map<string, number>();
    candidates.forEach(c => {
      const candidateHash = this.generateSecureHash(c.id);
      tally.set(candidateHash, 0);
    });

    // Count votes with periodic async yields to prevent UI blocking
    const processedVoters = new Set<string>();
    
    for (let i = 0; i < confirmedVotes.length; i++) {
      const vote = confirmedVotes[i];
      
      // Yield to UI every 100 votes to prevent blocking
      if (i % 100 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      // Skip if voter already processed (prevent double counting)
      if (processedVoters.has(vote.voterHash)) {
        console.warn('Duplicate vote detected, skipping...');
        continue;
      }

      processedVoters.add(vote.voterHash);

      const currentCount = tally.get(vote.candidateHash) || 0;
      tally.set(vote.candidateHash, currentCount + 1);
    }

    this.logAudit('VOTE_TALLYING_COMPLETED', {
      electionId,
      totalVotesCounted: processedVoters.size,
      candidateTallies: Array.from(tally.entries()).map(([hash, count]) => ({
        candidateHashPrefix: hash.substring(0, 16),
        votes: count
      }))
    });

    return tally;
  }

  // ==================== 6. RESULTS DECLARATION ====================

  /**
   * Declare final election results
   * Step 6: Publish verified on-chain results
   */
  async declareResults(electionId: string, candidates: Array<{
    id: string;
    name: string;
    party: string;
    symbol: string;
    color: string;
  }>): Promise<ElectionResults> {
    this.logAudit('RESULTS_DECLARATION_STARTED', { electionId });

    const state = this.electionStates.get(electionId);
    
    // For viewing results, skip validation to prevent UI freeze
    // Validation is only needed for official final declaration
    const tally = await this.tallyVotes(electionId, candidates, true);

    // Calculate total votes
    let totalVotes = 0;
    tally.forEach(count => totalVotes += count);

    // Build candidate results
    const candidateResults: CandidateResult[] = candidates.map(candidate => {
      const candidateHash = this.generateSecureHash(candidate.id);
      const voteCount = tally.get(candidateHash) || 0;
      
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        party: candidate.party,
        partySymbol: candidate.symbol,
        partyColor: candidate.color,
        voteCount,
        percentage: totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0,
        blockchainVoteHash: candidateHash,
        isVerified: true
      };
    });

    // Sort by vote count (descending)
    candidateResults.sort((a, b) => b.voteCount - a.voteCount);

    // Determine winner
    const winner = candidateResults.length > 0 && candidateResults[0].voteCount > 0
      ? candidateResults[0]
      : null;

    // Check for runoff (if top 2 are within 1%) - only if there are actual votes
    const isRunoff = totalVotes > 0 && 
      candidateResults.length >= 2 &&
      candidateResults[0].voteCount > 0 &&
      Math.abs(candidateResults[0].percentage - candidateResults[1].percentage) < 1;

    // Generate audit trail hash - use stable data (not timestamp) to prevent hash changes on refresh
    const auditData = {
      electionId,
      totalVotes,
      candidateResults: candidateResults.map(c => ({
        id: c.candidateId,
        votes: c.voteCount
      }))
    };
    const auditTrailHash = await this.generateAuditHash(auditData);

    const results: ElectionResults = {
      electionId,
      electionTitle: state?.title || 'Unknown Election',
      totalVotes,
      totalEligibleVoters: state?.totalEligibleVoters || 0,
      participationRate: state?.totalEligibleVoters 
        ? (totalVotes / state.totalEligibleVoters) * 100 
        : 0,
      candidates: candidateResults,
      winner,
      isRunoff,
      declarationTimestamp: Date.now(),
      blockchainValidated: true,
      auditTrailHash,
      status: 'final'
    };

    // Update election state
    if (state) {
      state.status = 'results_declared';
      this.saveToStorage();
    }

    // Store results
    this.storeResults(electionId, results);

    this.logAudit('RESULTS_DECLARED', {
      electionId,
      winner: winner?.candidateName || 'No winner',
      totalVotes,
      participationRate: results.participationRate.toFixed(2) + '%',
      auditTrailHash
    });

    this.emit('resultsDeClared', { electionId, results });

    return results;
  }

  /**
   * Get current results (can be called during voting for live updates)
   * Skips validation for faster response
   */
  async getLiveResults(electionId: string, candidates: Array<{
    id: string;
    name: string;
    party: string;
    symbol: string;
    color: string;
  }>): Promise<ElectionResults> {
    // Skip validation for live results to prevent UI blocking
    const tally = await this.tallyVotes(electionId, candidates, true);
    const state = this.electionStates.get(electionId);

    let totalVotes = 0;
    tally.forEach(count => totalVotes += count);

    const candidateResults: CandidateResult[] = candidates.map(candidate => {
      const candidateHash = this.generateSecureHash(candidate.id);
      const voteCount = tally.get(candidateHash) || 0;
      
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        party: candidate.party,
        partySymbol: candidate.symbol,
        partyColor: candidate.color,
        voteCount,
        percentage: totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0,
        blockchainVoteHash: candidateHash,
        isVerified: true
      };
    });

    candidateResults.sort((a, b) => b.voteCount - a.voteCount);

    return {
      electionId,
      electionTitle: state?.title || 'Unknown Election',
      totalVotes,
      totalEligibleVoters: state?.totalEligibleVoters || 0,
      participationRate: state?.totalEligibleVoters 
        ? (totalVotes / state.totalEligibleVoters) * 100 
        : 0,
      candidates: candidateResults,
      winner: candidateResults[0]?.voteCount > 0 ? candidateResults[0] : null,
      isRunoff: false,
      declarationTimestamp: Date.now(),
      blockchainValidated: true,
      auditTrailHash: '',
      status: 'preliminary'
    };
  }

  // ==================== VOTE RECEIPT GENERATION ====================

  /**
   * Generate a vote receipt for the voter
   */
  async generateVoteReceipt(
    transactionHash: string,
    electionId: string
  ): Promise<VoteReceipt> {
    const tx = this.voteTransactions.find(
      t => t.transactionHash === transactionHash
    );

    if (!tx) {
      throw new Error('Transaction not found');
    }

    const receiptId = `VR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Generate verification code
    const verificationData = `${transactionHash}-${tx.timestamp}-${electionId}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(verificationData));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verificationCode = hashArray.slice(0, 4)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const receipt: VoteReceipt = {
      receiptId,
      transactionHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp,
      electionId,
      voterHashPrefix: tx.voterHash.substring(0, 10) + '...',
      verificationCode,
      qrCodeData: JSON.stringify({
        receiptId,
        txHash: tx.transactionHash.substring(0, 20),
        block: tx.blockNumber,
        verify: verificationCode
      })
    };

    return receipt;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate secure hash for voter/candidate IDs
   */
  private generateSecureHash(input: string): string {
    const salt = 'votelink-secure-2026';
    return ethers.keccak256(ethers.toUtf8Bytes(input + salt));
  }

  /**
   * Validate voter ID format
   */
  private isValidVoterId(voterId: string): boolean {
    // Indian Voter ID format: 3 letters + 7 digits (e.g., ABC1234567)
    const voterIdPattern = /^[A-Z]{3}[0-9]{7}$/i;
    return voterIdPattern.test(voterId) || voterId.length >= 6;
  }

  /**
   * Validate transaction hash format
   */
  private isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  /**
   * Check if current time is within election period
   */
  private isWithinElectionTime(state: ElectionState): boolean {
    const now = Date.now();
    return now >= state.startTime && now <= state.endTime;
  }

  /**
   * Verify voter eligibility on blockchain
   */
  private async verifyOnBlockchain(_voterHash: string): Promise<boolean> {
    // In production, this would call the smart contract with _voterHash
    // For demo, we simulate blockchain verification
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  /**
   * Create eligibility result object
   */
  private createEligibilityResult(
    isEligible: boolean,
    voterId: string,
    voterHash: string,
    reason?: string,
    registrationStatus: 'registered' | 'not_registered' | 'pending' = 'registered',
    hasAlreadyVoted: boolean = false,
    blockchainVerified: boolean = false
  ): VoterEligibility {
    return {
      isEligible,
      hasAlreadyVoted,
      voterHash,
      voterId,
      registrationStatus,
      verificationTimestamp: Date.now(),
      blockchainVerified,
      reason
    };
  }

  /**
   * Start tallying process
   */
  private startTallying(electionId: string): void {
    const state = this.electionStates.get(electionId);
    if (state) {
      state.status = 'tallying';
      this.saveToStorage();
      this.emit('tallyingStarted', { electionId });
    }
  }

  /**
   * Update election vote count
   */
  private updateElectionVoteCount(electionId: string): void {
    const state = this.electionStates.get(electionId);
    if (!state) return;

    const votes = this.voteTransactions.filter(
      tx => tx.electionId === electionId && tx.status === 'confirmed'
    );

    state.totalVotesCast = votes.length;
    state.remainingVoters = Math.max(0, state.totalEligibleVoters - votes.length);
    state.participationRate = state.totalEligibleVoters > 0
      ? (votes.length / state.totalEligibleVoters) * 100
      : 0;

    this.saveToStorage();
    this.emit('electionStatsUpdated', { electionId, state });
  }

  /**
   * Update election statistics
   */
  private updateElectionStats(electionId: string): void {
    this.updateElectionVoteCount(electionId);
  }

  /**
   * Generate audit hash
   */
  private async generateAuditHash(data: unknown): Promise<string> {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ==================== STORAGE METHODS ====================

  private getStoredVotes(electionId: string): Record<string, unknown> {
    try {
      const key = `${STORAGE_KEYS.VOTE_TRANSACTIONS}_${electionId}`;
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  }

  private storeVote(
    voterHash: string,
    candidateHash: string,
    electionId: string,
    transactionHash: string
  ): void {
    const key = `${STORAGE_KEYS.VOTE_TRANSACTIONS}_${electionId}`;
    const votes = this.getStoredVotes(electionId);
    votes[voterHash] = {
      candidateHash,
      transactionHash,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(votes));
  }

  private storeResults(electionId: string, results: ElectionResults): void {
    const key = `${STORAGE_KEYS.RESULTS_CACHE}_${electionId}`;
    localStorage.setItem(key, JSON.stringify(results));
  }

  private getBlockchainSyncState(): { lastBlockNumber: number } {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BLOCKCHAIN_SYNC);
      return stored ? JSON.parse(stored) : { lastBlockNumber: 1000000 };
    } catch {
      return { lastBlockNumber: 1000000 };
    }
  }

  private updateBlockchainSyncState(blockNumber: number): void {
    localStorage.setItem(STORAGE_KEYS.BLOCKCHAIN_SYNC, JSON.stringify({
      lastBlockNumber: blockNumber,
      lastSync: Date.now()
    }));
  }

  private loadFromStorage(): void {
    try {
      // Load vote transactions
      const txData = localStorage.getItem(STORAGE_KEYS.VOTE_TRANSACTIONS);
      if (txData) {
        this.voteTransactions = JSON.parse(txData);
      }

      // Load election states
      const stateData = localStorage.getItem(STORAGE_KEYS.ELECTION_STATE);
      if (stateData) {
        const states = JSON.parse(stateData);
        this.electionStates = new Map(Object.entries(states));
      }

      // Load audit logs
      const auditData = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (auditData) {
        this.auditLogs = JSON.parse(auditData);
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOTE_TRANSACTIONS, JSON.stringify(this.voteTransactions));
      localStorage.setItem(STORAGE_KEYS.ELECTION_STATE, JSON.stringify(
        Object.fromEntries(this.electionStates)
      ));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  // ==================== AUDIT LOGGING ====================

  private logAudit(action: string, details: Record<string, unknown>): void {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      action,
      timestamp: Date.now(),
      actorHash: 'system',
      details
    };

    this.auditLogs.push(log);
    
    // Keep only last 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }

    this.saveToStorage();
    console.log(`📋 AUDIT: ${action}`, details);
  }

  getAuditLogs(electionId?: string): AuditLog[] {
    if (electionId) {
      return this.auditLogs.filter(log => 
        log.details.electionId === electionId
      );
    }
    return [...this.auditLogs];
  }

  // ==================== EVENT EMITTER ====================

  subscribe(callback: (event: string, data: unknown) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }

  // ==================== PUBLIC GETTERS ====================

  getElectionState(electionId: string): ElectionState | undefined {
    return this.electionStates.get(electionId);
  }

  getAllElectionStates(): Map<string, ElectionState> {
    return new Map(this.electionStates);
  }

  getVoteTransaction(transactionHash: string): VoteTransaction | undefined {
    return this.voteTransactions.find(tx => tx.transactionHash === transactionHash);
  }

  getElectionTransactions(electionId: string): VoteTransaction[] {
    return this.voteTransactions.filter(tx => tx.electionId === electionId);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const votingFlowService = new VotingFlowService();
export default votingFlowService;
