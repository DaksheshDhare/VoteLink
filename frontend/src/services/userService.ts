// Frontend service for managing users in the database

interface User {
  id: string;
  email: string;
  mobile?: string;
  voterID?: string;
  name?: string;
  role: 'voter' | 'admin';
  isVerified: boolean;
  hasVoted: boolean;
  votedAt?: string;
  region?: {
    state?: string;
    district?: string;
    constituency?: string;
  };
  isDisabledVoter: boolean;
  hasFaceData: boolean;
  faceDataCapturedAt?: string;
  blockchainAddress?: string;
  lastLogin?: string;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: string;
  updatedAt: string;
}

interface VoteInfo {
  candidateName: string;
  partyName: string;
  region: {
    state?: string;
    district?: string;
    constituency?: string;
  };
  votedAt: string;
  blockchainTxHash?: string;
  blockchainConfirmed: boolean;
}

interface AuditLog {
  action: string;
  userEmail: string;
  voterID?: string;
  details?: Record<string, unknown>;
  status: string;
  ipAddress?: string;
  deviceInfo?: string;
  timestamp: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  votedUsers: number;
  adminUsers: number;
  disabledVoters: number;
}

interface GetAllUsersResponse {
  success: boolean;
  data?: {
    users: User[];
    pagination: PaginationInfo;
    stats: UserStats;
  };
  error?: string;
}

interface GetUserDetailsResponse {
  success: boolean;
  data?: {
    user: User;
    voteInfo: VoteInfo | null;
    auditLogs: AuditLog[];
  };
  error?: string;
}

interface UpdateUserResponse {
  success: boolean;
  message?: string;
  user?: Partial<User>;
  error?: string;
}

interface DeleteUserResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  hasVoted?: boolean;
  role?: 'voter' | 'admin';
  sortBy?: 'createdAt' | 'lastLogin' | 'email' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface UpdateUserParams {
  name?: string;
  role?: 'voter' | 'admin';
  isDisabledVoter?: boolean;
  region?: {
    state?: string;
    district?: string;
    constituency?: string;
  };
  blockchainAddress?: string;
}

class UserService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('votelink_session_token');
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, mergedOptions);
    return response.json();
  }

  /**
   * Get all users with optional filtering and pagination
   */
  async getAllUsers(params: GetAllUsersParams = {}): Promise<GetAllUsersResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.hasVoted !== undefined) queryParams.append('hasVoted', params.hasVoted.toString());
      if (params.role) queryParams.append('role', params.role);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

      return await this.makeRequest<GetAllUsersResponse>(endpoint);
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        error: 'Failed to fetch users'
      };
    }
  }

  /**
   * Get single user details by email, voterID, or MongoDB ID
   */
  async getUserDetails(identifier: string): Promise<GetUserDetailsResponse> {
    try {
      return await this.makeRequest<GetUserDetailsResponse>(
        `/users/${encodeURIComponent(identifier)}/details`
      );
    } catch (error) {
      console.error('Get user details error:', error);
      return {
        success: false,
        error: 'Failed to fetch user details'
      };
    }
  }

  /**
   * Update user details
   */
  async updateUser(identifier: string, data: UpdateUserParams): Promise<UpdateUserResponse> {
    try {
      return await this.makeRequest<UpdateUserResponse>(
        `/users/${encodeURIComponent(identifier)}`,
        {
          method: 'PUT',
          body: JSON.stringify(data)
        }
      );
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  /**
   * Delete user (only allowed if user hasn't voted)
   */
  async deleteUser(identifier: string): Promise<DeleteUserResponse> {
    try {
      return await this.makeRequest<DeleteUserResponse>(
        `/users/${encodeURIComponent(identifier)}`,
        {
          method: 'DELETE'
        }
      );
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }

  /**
   * Search users by email, name, voterID, or mobile
   */
  async searchUsers(searchTerm: string, limit: number = 20): Promise<GetAllUsersResponse> {
    return this.getAllUsers({ search: searchTerm, limit });
  }

  /**
   * Get users who have voted
   */
  async getVotedUsers(page: number = 1, limit: number = 50): Promise<GetAllUsersResponse> {
    return this.getAllUsers({ hasVoted: true, page, limit });
  }

  /**
   * Get users who haven't voted yet
   */
  async getPendingVoters(page: number = 1, limit: number = 50): Promise<GetAllUsersResponse> {
    return this.getAllUsers({ hasVoted: false, page, limit });
  }

  /**
   * Get admin users
   */
  async getAdminUsers(): Promise<GetAllUsersResponse> {
    return this.getAllUsers({ role: 'admin' });
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats | null> {
    try {
      const response = await this.getAllUsers({ limit: 1 });
      if (response.success && response.data) {
        return response.data.stats;
      }
      return null;
    } catch (error) {
      console.error('Get user stats error:', error);
      return null;
    }
  }

  /**
   * Export users to CSV format
   */
  async exportUsersToCSV(): Promise<string> {
    try {
      const response = await this.getAllUsers({ limit: 10000 });
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch users for export');
      }

      const headers = [
        'ID',
        'Email',
        'Mobile',
        'Voter ID',
        'Name',
        'Role',
        'Verified',
        'Has Voted',
        'Voted At',
        'State',
        'District',
        'Constituency',
        'Disabled Voter',
        'Has Face Data',
        'Last Login',
        'Created At'
      ];

      const rows = response.data.users.map(user => [
        user.id,
        user.email,
        user.mobile || '',
        user.voterID || '',
        user.name || '',
        user.role,
        user.isVerified ? 'Yes' : 'No',
        user.hasVoted ? 'Yes' : 'No',
        user.votedAt || '',
        user.region?.state || '',
        user.region?.district || '',
        user.region?.constituency || '',
        user.isDisabledVoter ? 'Yes' : 'No',
        user.hasFaceData ? 'Yes' : 'No',
        user.lastLogin || '',
        user.createdAt
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Export users error:', error);
      throw error;
    }
  }

  /**
   * Download users as CSV file
   */
  async downloadUsersCSV(): Promise<void> {
    try {
      const csvContent = await this.exportUsersToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download CSV error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;
export { UserService };
export type {
  User,
  VoteInfo,
  AuditLog,
  PaginationInfo,
  UserStats,
  GetAllUsersResponse,
  GetUserDetailsResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  GetAllUsersParams,
  UpdateUserParams
};
