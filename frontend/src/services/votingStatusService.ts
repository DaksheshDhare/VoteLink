/**
 * Voting Status Service
 * Fetches and manages voting state from backend
 * Source of truth: Backend database (NOT localStorage)
 */

interface VotedElection {
  electionId: string;
  votedAt: string;
}

interface VotingStatusResponse {
  success: boolean;
  data?: {
    email: string;
    exists: boolean;
    hasVoted: boolean;
    votedElections?: VotedElection[];
    user?: {
      id: string;
      voterID: string;
      name: string;
      mobile: string;
      hasVoted: boolean;
      votedAt: string | null;
      votedElections?: VotedElection[];
      createdAt: string;
    };
    vote?: {
      id: string;
      candidateName: string;
      partyName: string;
      votedAt: string;
      blockchainConfirmed: boolean;
    };
  };
  error?: string;
}

interface LoginResponseData {
  token: string;
  email: string;
  expiresAt: string;
  user?: {
    id: string;
    email: string;
    mobile: string;
    hasVoted: boolean;
    voterID: string;
  };
}

class VotingStatusService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Check voting status for a user from backend
   * This is the authoritative source - always fetch from backend
   * @param email - User's email
   * @returns Promise with voting status
   */
  async getVotingStatus(email: string): Promise<VotingStatusResponse> {
    try {
      const response = await fetch(`${this.baseURL}/admin/voting-status/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get voting status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voting status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if email has already voted
   * Returns true if user has voted, false otherwise
   * @param email - User's email
   * @returns Promise<boolean>
   */
  async hasUserVoted(email: string): Promise<boolean> {
    try {
      const status = await this.getVotingStatus(email);
      
      if (!status.success || !status.data) {
        console.warn('Failed to fetch voting status for', email);
        return false;
      }

      return status.data.hasVoted;
    } catch (error) {
      console.error('Error checking voting status:', error);
      return false;
    }
  }

  /**
   * Extract voting status from login response
   * Backend login response now includes hasVoted status
   * @param loginData - Login response from backend
   * @returns boolean indicating if user has already voted
   */
  extractVotingStatusFromLoginResponse(loginData: LoginResponseData): boolean {
    return loginData.user?.hasVoted || false;
  }

  /**
   * Clear any cached voting data from localStorage
   * Frontend should not cache voting state - always fetch from backend
   */
  clearCachedVotingData(): void {
    const keys = [
      'votedEmails',
      'votedMobiles',
      'votedVoterIDs',
      'votelink_voted_emails',
      'votelink_voted_mobiles',
      'hasVoted',
      'userVotingStatus'
    ];

    keys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared cached voting data: ${key}`);
    });
  }

  /**
   * Admin endpoint to reset voting status
   * Only for testing/development - requires admin access
   * @param email - User's email to reset
   * @returns Promise with reset result
   */
  async adminResetVotingStatus(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/admin/reset-voting-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`Failed to reset voting status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        error: data.error
      };
    } catch (error) {
      console.error('Error resetting voting status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get voting history for user
   * @param email - User's email
   * @returns Promise with voting history
   */
  async getVotingHistory(email: string): Promise<any> {
    try {
      const status = await this.getVotingStatus(email);
      
      if (!status.success || !status.data) {
        return null;
      }

      return {
        email: status.data.email,
        hasVoted: status.data.hasVoted,
        votedAt: status.data.user?.votedAt || status.data.vote?.votedAt,
        candidate: status.data.vote?.candidateName,
        party: status.data.vote?.partyName,
        blockchainConfirmed: status.data.vote?.blockchainConfirmed
      };
    } catch (error) {
      console.error('Error getting voting history:', error);
      return null;
    }
  }
}

export const votingStatusService = new VotingStatusService();
