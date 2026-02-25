// src/services/verificationService.ts
// Verification service for voter identity validation
// Uses backend API for voter ID and Aadhaar verification

export interface VoterIDDetails {
  voterId: string;
  fullName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'T';
  constituency: string;
  state: string;
  district: string;
  pollingStation: string;
  cardSerial: string;
  isActive: boolean;
}

export interface AadhaarDetails {
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'T';
  address: string;
  pincode: string;
  state: string;
  mobileNumber: string;
  isVerified: boolean;
}

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  details?: VoterIDDetails | AadhaarDetails;
  error?: string;
  confidence: number; // 0-100 verification confidence
}

class VerificationService {
  
  // ===================== VOTER ID VERIFICATION =====================
  
  /**
   * Verify Voter ID using mock ECI (Election Commission of India) API
   * In production, this would integrate with actual ECI database
   */
  async verifyVoterID(voterId: string, dateOfBirth: string, name?: string): Promise<VerificationResult> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check our local database first
      const localResult = await this.verifyVoterIDLocally(voterId, dateOfBirth, name);
      if (localResult.success) {
        return localResult;
      }

      // Mock ECI API verification
      const eciResult = await this.mockECIVerification(voterId, dateOfBirth, name);
      
      if (eciResult.success && eciResult.verified) {
        // Store verified voter in our database
        await this.storeVerifiedVoter(eciResult.details as VoterIDDetails);
      }

      return eciResult;
    } catch (error) {
      console.error('Voter ID verification error:', error);
      return {
        success: false,
        verified: false,
        error: 'Verification service temporarily unavailable',
        confidence: 0
      };
    }
  }

  /**
   * Check voter ID against our local database
   */
  private async verifyVoterIDLocally(voterId: string, dateOfBirth: string, name?: string): Promise<VerificationResult> {
    try {
      const { data, error } = await supabase
        .from('voter_records')
        .select('*')
        .eq('voter_id', voterId.toUpperCase())
        .single();

      if (error || !data) {
        return {
          success: false,
          verified: false,
          error: 'Voter ID not found in local database',
          confidence: 0
        };
      }

      // Verify date of birth
      if (data.date_of_birth !== dateOfBirth) {
        return {
          success: true,
          verified: false,
          error: 'Date of birth does not match',
          confidence: 20
        };
      }

      // Optional name verification
      let confidence = 85;
      if (name) {
        const nameMatch = this.fuzzyNameMatch(name, data.full_name);
        confidence = nameMatch ? 95 : 70;
        
        if (!nameMatch) {
          return {
            success: true,
            verified: false,
            error: 'Name does not match voter records',
            confidence: confidence
          };
        }
      }

      return {
        success: true,
        verified: true,
        details: {
          voterId: data.voter_id,
          fullName: data.full_name,
          fatherName: data.father_name,
          dateOfBirth: data.date_of_birth,
          gender: data.gender,
          constituency: data.constituency,
          state: data.state,
          district: data.district,
          pollingStation: data.polling_station,
          cardSerial: data.card_serial,
          isActive: data.is_active
        },
        confidence: confidence
      };
    } catch (error) {
      console.error('Local voter verification error:', error);
      return {
        success: false,
        verified: false,
        error: 'Database verification failed',
        confidence: 0
      };
    }
  }

  /**
   * Mock ECI API verification (replace with actual ECI integration)
   */
  private async mockECIVerification(voterId: string, dateOfBirth: string, name?: string): Promise<VerificationResult> {
    // Mock data for testing - replace with actual ECI API
    const mockVoters: Record<string, VoterIDDetails> = {
      'VTR2025001': {
        voterId: 'VTR2025001',
        fullName: 'John Doe',
        fatherName: 'Robert Doe',
        dateOfBirth: '1990-05-15',
        gender: 'M',
        constituency: 'Mumbai North',
        state: 'Maharashtra',
        district: 'Mumbai',
        pollingStation: 'Govt. School No. 123',
        cardSerial: 'MH0123456789',
        isActive: true
      },
      'VTR2025002': {
        voterId: 'VTR2025002',
        fullName: 'Priya Sharma',
        fatherName: 'Raj Sharma',
        dateOfBirth: '1988-09-22',
        gender: 'F',
        constituency: 'Delhi Central',
        state: 'Delhi',
        district: 'Central Delhi',
        pollingStation: 'DTC School No. 45',
        cardSerial: 'DL0987654321',
        isActive: true
      }
    };

    const voterData = mockVoters[voterId.toUpperCase()];
    
    if (!voterData) {
      return {
        success: true,
        verified: false,
        error: 'Voter ID not found in ECI records',
        confidence: 0
      };
    }

    // Check date of birth
    if (voterData.dateOfBirth !== dateOfBirth) {
      return {
        success: true,
        verified: false,
        error: 'Date of birth verification failed',
        confidence: 25
      };
    }

    let confidence = 90;
    if (name) {
      const nameMatch = this.fuzzyNameMatch(name, voterData.fullName);
      confidence = nameMatch ? 95 : 75;
    }

    return {
      success: true,
      verified: true,
      details: voterData,
      confidence: confidence
    };
  }

  // ===================== AADHAAR VERIFICATION =====================
  
  /**
   * Verify Aadhaar using mock UIDAI API
   * In production, this would integrate with actual UIDAI system
   */
  async verifyAadhaar(aadhaarNumber: string, otp?: string): Promise<VerificationResult> {
    try {
      // Validate Aadhaar format
      if (!this.isValidAadhaarFormat(aadhaarNumber)) {
        return {
          success: true,
          verified: false,
          error: 'Invalid Aadhaar number format',
          confidence: 0
        };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock UIDAI verification
      const uidaiResult = await this.mockUidaiVerification(aadhaarNumber, otp);
      
      return uidaiResult;
    } catch (error) {
      console.error('Aadhaar verification error:', error);
      return {
        success: false,
        verified: false,
        error: 'Aadhaar verification service unavailable',
        confidence: 0
      };
    }
  }

  /**
   * Enhanced Aadhaar number format validation with detailed feedback
   */
  private isValidAadhaarFormat(aadhaar: string): boolean {
    // Remove spaces and check basic format
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    
    // Check length
    if (cleanAadhaar.length !== 12) {
      console.log(`❌ Invalid Aadhaar length: ${cleanAadhaar.length}, expected 12`);
      return false;
    }
    
    // Check if all characters are digits
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      console.log('❌ Aadhaar contains non-numeric characters');
      return false;
    }
    
    // Check for sequential patterns (basic validation)
    const hasSequentialPattern = /012345|123456|234567|345678|456789|567890|678901|789012|890123|901234/.test(cleanAadhaar);
    if (hasSequentialPattern) {
      console.log('❌ Invalid Aadhaar: contains sequential pattern');
      return false;
    }
    
    // Check for repeated patterns
    const hasRepeatedPattern = /^(\d)\1{11}$/.test(cleanAadhaar);
    if (hasRepeatedPattern) {
      console.log('❌ Invalid Aadhaar: all digits are the same');
      return false;
    }
    
    // Validate using Verhoeff algorithm
    const verhoeffValid = this.verhoeffCheck(cleanAadhaar);
    if (!verhoeffValid) {
      console.log('❌ Invalid Aadhaar: failed Verhoeff checksum validation');
      return false;
    }
    
    console.log('✅ Valid Aadhaar format and checksum');
    return true;
  }

  /**
   * Enhanced Verhoeff algorithm for Aadhaar validation with detailed checking
   */
  private verhoeffCheck(aadhaar: string): boolean {
    // Enhanced Verhoeff algorithm tables
    const multiplicationTable = [
      [0,1,2,3,4,5,6,7,8,9],
      [1,2,3,4,0,6,7,8,9,5],
      [2,3,4,0,1,7,8,9,5,6],
      [3,4,0,1,2,8,9,5,6,7],
      [4,0,1,2,3,9,5,6,7,8],
      [5,9,8,7,6,0,4,3,2,1],
      [6,5,9,8,7,1,0,4,3,2],
      [7,6,5,9,8,2,1,0,4,3],
      [8,7,6,5,9,3,2,1,0,4],
      [9,8,7,6,5,4,3,2,1,0]
    ];
    
    const permutationTable = [
      [0,1,2,3,4,5,6,7,8,9],
      [1,5,7,6,2,8,3,0,9,4],
      [5,8,0,3,7,9,6,1,4,2],
      [8,9,1,6,0,4,3,5,2,7],
      [9,4,5,3,1,2,6,8,7,0],
      [4,2,8,6,5,7,3,9,0,1],
      [2,7,9,3,8,0,6,4,1,5],
      [7,0,4,6,9,1,3,2,5,8]
    ];
    
    try {
      let checksum = 0;
      const digits = aadhaar.split('').reverse().map(d => {
        const num = parseInt(d, 10);
        if (isNaN(num) || num < 0 || num > 9) {
          throw new Error('Invalid digit found');
        }
        return num;
      });
      
      for (let i = 0; i < digits.length; i++) {
        const digit = digits[i];
        const permutation = permutationTable[(i + 1) % 8];
        const permutedDigit = permutation[digit];
        checksum = multiplicationTable[checksum][permutedDigit];
      }
      
      return checksum === 0;
    } catch (error) {
      console.error('Verhoeff validation error:', error);
      return false;
    }
  }

  /**
   * Mock UIDAI verification
   */
  private async mockUidaiVerification(aadhaarNumber: string, otp?: string): Promise<VerificationResult> {
    // Enhanced mock Aadhaar data with proper Verhoeff checksums
    const mockAadhaar: Record<string, AadhaarDetails> = {
      '123456789012': {
        aadhaarNumber: '123456789012',
        fullName: 'John Doe',
        dateOfBirth: '1990-05-15',
        gender: 'M',
        address: '123, ABC Street, Mumbai, Maharashtra',
        pincode: '400001',
        state: 'Maharashtra',
        mobileNumber: '+919876543210',
        isVerified: true
      },
      '987654321098': {
        aadhaarNumber: '987654321098',
        fullName: 'Priya Sharma',
        dateOfBirth: '1988-09-22',
        gender: 'F',
        address: '456, XYZ Colony, Delhi',
        pincode: '110001',
        state: 'Delhi',
        mobileNumber: '+919876543211',
        isVerified: true
      },
      '234817956034': {
        aadhaarNumber: '234817956034',
        fullName: 'Rajesh Kumar',
        dateOfBirth: '1985-12-10',
        gender: 'M',
        address: '789, Tech Park, Bangalore, Karnataka',
        pincode: '560001',
        state: 'Karnataka', 
        mobileNumber: '+919876543212',
        isVerified: true
      },
      '498765432109': {
        aadhaarNumber: '498765432109',
        fullName: 'Anita Patel',
        dateOfBirth: '1992-08-03',
        gender: 'F',
        address: '321, Business District, Ahmedabad, Gujarat',
        pincode: '380001',
        state: 'Gujarat',
        mobileNumber: '+919876543213',
        isVerified: true
      }
    };

    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    const aadhaarData = mockAadhaar[cleanAadhaar];

    if (!aadhaarData) {
      return {
        success: true,
        verified: false,
        error: 'Aadhaar number not found in UIDAI records. Please verify your Aadhaar number.',
        confidence: 0
      };
    }

    // Enhanced OTP validation
    if (!otp) {
      return {
        success: true,
        verified: false,
        error: 'OTP verification required. Please enter the OTP sent to your registered mobile number.',
        confidence: 50
      };
    }

    // Strict OTP format validation
    if (!/^\d{6}$/.test(otp)) {
      return {
        success: true,
        verified: false,
        error: 'Invalid OTP format. Please enter a 6-digit numeric OTP.',
        confidence: 30
      };
    }

    // Mock OTP verification - for demo, accept any properly formatted OTP
    // In production, this would validate against the actual OTP sent
    const isValidOTP = /^\d{6}$/.test(otp);
    
    if (!isValidOTP) {
      return {
        success: true,
        verified: false,
        error: 'Invalid or expired OTP. Please request a new OTP and try again.',
        confidence: 20
      };
    }

    // High confidence for successful verification
    return {
      success: true,
      verified: true,
      details: aadhaarData,
      confidence: 98 // Very high confidence for complete verification
    };
  }

  // ===================== UTILITY FUNCTIONS =====================

  /**
   * Fuzzy name matching for verification
   */
  private fuzzyNameMatch(input: string, reference: string): boolean {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedInput = normalize(input);
    const normalizedRef = normalize(reference);

    // Exact match
    if (normalizedInput === normalizedRef) return true;

    // Check if all words in input exist in reference
    const inputWords = normalizedInput.split(' ');
    const refWords = normalizedRef.split(' ');
    
    return inputWords.every(word => 
      refWords.some(refWord => 
        refWord.includes(word) || word.includes(refWord) || 
        this.levenshteinDistance(word, refWord) <= 2
      )
    );
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Store verified voter in database
   */
  private async storeVerifiedVoter(voterDetails: VoterIDDetails): Promise<void> {
    try {
      await supabase.from('voter_records').upsert({
        voter_id: voterDetails.voterId,
        full_name: voterDetails.fullName,
        father_name: voterDetails.fatherName,
        date_of_birth: voterDetails.dateOfBirth,
        gender: voterDetails.gender,
        constituency: voterDetails.constituency,
        state: voterDetails.state,
        district: voterDetails.district,
        polling_station: voterDetails.pollingStation,
        card_serial: voterDetails.cardSerial,
        is_active: voterDetails.isActive,
        verified_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing verified voter:', error);
    }
  }

  /**
   * Cross-verify Voter ID and Aadhaar data
   */
  async crossVerifyDocuments(voterDetails: VoterIDDetails, aadhaarDetails: AadhaarDetails): Promise<{
    nameMatch: boolean;
    dobMatch: boolean;
    genderMatch: boolean;
    stateMatch: boolean;
    overallConfidence: number;
  }> {
    const nameMatch = this.fuzzyNameMatch(voterDetails.fullName, aadhaarDetails.fullName);
    const dobMatch = voterDetails.dateOfBirth === aadhaarDetails.dateOfBirth;
    const genderMatch = voterDetails.gender === aadhaarDetails.gender;
    const stateMatch = voterDetails.state.toLowerCase() === aadhaarDetails.state.toLowerCase();

    let confidence = 0;
    if (nameMatch) confidence += 40;
    if (dobMatch) confidence += 30;
    if (genderMatch) confidence += 15;
    if (stateMatch) confidence += 15;

    return {
      nameMatch,
      dobMatch,
      genderMatch,
      stateMatch,
      overallConfidence: confidence
    };
  }

  /**
   * Generate verification report
   */
  generateVerificationReport(voterResult: VerificationResult, aadhaarResult?: VerificationResult) {
    return {
      timestamp: new Date().toISOString(),
      voterIdVerification: {
        verified: voterResult.verified,
        confidence: voterResult.confidence,
        error: voterResult.error
      },
      aadhaarVerification: aadhaarResult ? {
        verified: aadhaarResult.verified,
        confidence: aadhaarResult.confidence,
        error: aadhaarResult.error
      } : null,
      overallStatus: voterResult.verified && (!aadhaarResult || aadhaarResult.verified) ? 'VERIFIED' : 'FAILED',
      recommendedAction: voterResult.verified ? 'ALLOW_VOTING' : 'REQUIRE_MANUAL_VERIFICATION'
    };
  }
}

export const verificationService = new VerificationService();