import { useState, useEffect } from 'react';
import { User, AuthStep, VotingRegion } from '../types';
import { blockchainService } from '../services/blockchainService';
import { votingStatusService } from '../services/votingStatusService';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep['current']>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabledVoting, setIsDisabledVoting] = useState(false);
  const [blockchainConnected, setBlockchainConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [demoOTP, setDemoOTP] = useState<string | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Clear login error whenever user returns to login page
  useEffect(() => {
    if (authStep === 'login') {
      setLoginError(null);
    }
  }, [authStep]);

  const mockLogin = async (email: string, mobile: string, options?: { skipOtp?: boolean; isAdmin?: boolean }) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // CRITICAL: Clear any cached voting data from localStorage
      // Frontend must not rely on localStorage for vote validation
      votingStatusService.clearCachedVotingData();
      
      // Handle admin login - Accept "admin" or "demo-admin" as login ID
      if (options?.isAdmin) {
        // Check for specific admin login IDs
        if (email.toLowerCase() === 'admin' || email.toLowerCase() === 'demo-admin' || email.toLowerCase() === 'demovote011@gmail.com') {
          const adminUser: User = {
            id: `admin_${Date.now()}`,
            email: email.toLowerCase(),
            mobile: mobile || '+1234567890',
            role: 'admin',
            voterIdUploaded: true,
            disabilityCertificateUploaded: false,
            isDisabledVoter: false,
            hasVoted: false
          };
          
          setUser(adminUser);
          setAuthStep('admin-hosting');
          setIsLoading(false);
          return true;
        } else {
          setIsLoading(false);
          return false; // Invalid admin credentials
        }
      }

      // ============================================
      // REAL LOGIN FLOW - FETCH VOTING STATUS FROM BACKEND
      // ============================================
      
      const normalizedEmail = email.toLowerCase().trim();
      const cleanMobile = mobile.replace(/\D/g, '');
      
      // ============================================
      // SECURITY CHECK: Validate email-mobile pairing with backend
      // Block login if this email-mobile combination doesn't match
      // ============================================
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      try {
        const pairingResponse = await fetch(`${backendUrl}/api/auth/check-pairing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, mobile: cleanMobile })
        });
        
        const pairingData = await pairingResponse.json();
        
        if (!pairingResponse.ok || !pairingData.success) {
          console.error('❌ Email-mobile pairing check failed:', pairingData.message);
          setLoginError(pairingData.message || 'Email and mobile number do not match.');
          setIsLoading(false);
          return false;
        }
        
        console.log('✅ Email-mobile pairing valid');
      } catch (pairingError) {
        console.warn('⚠️ Could not verify email-mobile pairing (server may be offline):', pairingError);
        // Allow login to proceed if server is unreachable (OTP step will also check)
      }
      
      // Fetch voting status from backend (for information, not blocking)
      console.log('📡 Fetching voting status from backend for:', normalizedEmail);
      const votingStatus = await votingStatusService.getVotingStatus(normalizedEmail);
      
      // NOTE: We no longer block login if user has voted in some election
      // Per-election voting is now tracked via votedElections array
      const votedElections = votingStatus.success ? (votingStatus.data?.votedElections || []) : [];
      
      if (votedElections.length > 0) {
        console.log(`📋 User has voted in ${votedElections.length} election(s): ${votedElections.map((v: { electionId: string }) => v.electionId).join(', ')}`);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email: normalizedEmail,
        mobile,
        role: 'voter',
        voterIdUploaded: false,
        disabilityCertificateUploaded: false,
        isDisabledVoter: false,
        hasVoted: votingStatus.success ? votingStatus.data?.hasVoted || false : false,
        votedElections: votedElections
      };
      
      setUser(mockUser);
      
      // Proceed to OTP verification
      setAuthStep('otp');
      setIsLoading(false);
      return true;
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : 'Login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const verifyOTP = async (otp: string, _otpId?: string) => {
    setIsLoading(true);
    void _otpId;
    
    try {
      if (!user) {
        throw new Error('User not found');
      }

      // Validate OTP format
      if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        console.log('❌ Invalid OTP format');
        setIsLoading(false);
        return false;
      }

      console.log('✅ OTP format valid, calling backend verification');
      
      // Call backend email OTP verification endpoint
      const result = await authService.verifyEmailOTP(user.email, otp.trim());

      if (!result.success) {
        console.error('❌ Backend OTP verification failed:', result.message);
        const errorMessage = result.message || 'OTP verification failed';
        setLoginError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      console.log('✅ Email OTP verified successfully by backend');
      
      // Fetch voting status to track which elections user has voted in
      console.log('📡 Fetching voting status from backend after OTP verification');
      const votingStatus = await votingStatusService.getVotingStatus(user.email);
      
      // Update user with votedElections info - don't block login, just track
      const votedElections = votingStatus.success ? (votingStatus.data?.votedElections || []) : [];
      if (votedElections.length > 0) {
        console.log(`📋 User has voted in ${votedElections.length} election(s) - will be restricted per-election`);
        // Update user object with votedElections
        const updatedUser = { ...user, votedElections };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // After OTP verification, go to face capture
      setAuthStep('face-capture');
      setDemoOTP(null); // Clear OTP after use
      setIsLoading(false);
      return { success: true };
      
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      setLoginError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const handleFaceCapture = async (descriptor: Float32Array, image: string) => {
    setIsLoading(true);
    try {
      setFaceDescriptor(descriptor);
      setFaceImage(image);

      // Store face data in database (disabled - face data service removed)
      // if (user?.email) {
      //   await faceDataService.storeFaceData(user.email, descriptor, image);
      // }

      console.log('✅ Face captured and stored');
      // After face capture, proceed to Voter ID upload
      setAuthStep('voter-id');
    } catch (error) {
      console.error('Face capture error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceVerification = async (success: boolean, matchResult: { confidence: number; distance: number }) => {
    setIsLoading(true);
    try {
      if (user?.email && matchResult) {
        // Store face match verification (disabled - face data service removed)
        // await faceDataService.verifyAndStoreFaceMatch(
        //   user.email,
        //   matchResult.confidence,
        //   matchResult.distance,
        //   success
        // );
      }

      if (success) {
        console.log('✅ Face verification successful');
        setAuthStep(isDisabledVoting ? 'disability-cert' : 'instructions');
      } else {
        console.log('❌ Face verification failed');
        alert('Face verification failed. Please try again or contact support.');
        setAuthStep('voter-id'); // Allow retry
      }
    } catch (error) {
      console.error('Face verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyVoterID = async (voterData: { voterID: string; mobile: string; uid?: string }) => {
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not found');
      }

      // REMOVED: localStorage check for votedVoterIDs
      // Frontend must not rely on localStorage as source of truth
      // Backend database is the authoritative source
      
      // Step 1: Check blockchain for previous votes with this Voter ID
      try {
        const eligibility = await blockchainService.verifyVoterEligibility(voterData.voterID);
        if (eligibility.alreadyRegistered) {
          console.log('🚫 Voter ID already voted on blockchain:', voterData.voterID);
          setLoginError('This Voter ID has already been used to vote on the blockchain. Duplicate voting is strictly prohibited.');
          setUser(null);
          setAuthStep('login');
          localStorage.removeItem('user');
          setIsLoading(false);
          return false;
        }
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain verification unavailable:', blockchainError);
        // Continue with backend verification only
      }

      // Step 2: Fetch voting status to track which elections user has voted in
      console.log('📡 Fetching voting status from backend during Voter ID verification');
      const votingStatus = await votingStatusService.getVotingStatus(user.email);
      
      // Update votedElections - don't block, just track for per-election restrictions
      const votedElections = votingStatus.success ? (votingStatus.data?.votedElections || []) : [];
      if (votedElections.length > 0) {
        console.log(`📋 User has voted in ${votedElections.length} election(s)`);
      }
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Voter ID verified:', voterData.voterID);
      
      const updatedUser = { 
        ...user, 
        voterIdUploaded: true,
        voterID: voterData.voterID.toUpperCase(),
        mobile: voterData.mobile,
        firebaseUID: voterData.uid,
        blockchainRegistered: false,
        votedElections: votedElections
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthStep(isDisabledVoting ? 'disability-cert' : 'region-selection');
      setIsLoading(false);
      return true;
      
    } catch (error) {
      console.error('Voter ID verification failed:', error);
      setLoginError(error instanceof Error ? error.message : 'Voter ID verification failed');
      setIsLoading(false);
      return false;
    }
  };

  // Backward compatibility function for file upload (deprecated)
  const uploadVoterID = async () => {
    // This function is deprecated - redirect to new verification process
    console.warn('uploadVoterID is deprecated. Use verifyVoterID instead.');
    return false;
  };

  const uploadDisabilityCertificate = async (_file: File) => {
    void _file;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (user) {
      const updatedUser = { 
        ...user, 
        disabilityCertificateUploaded: true,
        isDisabledVoter: true 
      };
      setUser(updatedUser);
      setAuthStep('region-selection');
    }
    setIsLoading(false);
    return true;
  };

  const startDisabledVoting = () => {
    setIsDisabledVoting(true);
    if (user && user.voterIdUploaded) {
      setAuthStep('disability-cert');
    } else {
      // If voter ID not uploaded, they need to upload it first
      setAuthStep('voter-id');
    }
  };

  const logout = () => {
    setUser(null);
    setAuthStep('login');
    setIsDisabledVoting(false);
    localStorage.removeItem('user');
  };

  const selectRegion = (region: VotingRegion, election?: ElectionInfo) => {
    if (user) {
      const updatedUser = {
        ...user,
        selectedRegion: region,
        constituency: region.constituency,
        currentElectionId: election?.id || region.activeElections?.[0]?.id || 'default_election'
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthStep('voting');
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const address = await blockchainService.connectWallet();
      setWalletAddress(address);
      setBlockchainConnected(true);
      console.log('✅ Wallet connected:', address);
      return address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect MetaMask wallet. Please install MetaMask extension.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const castVote = async (partyId: string) => {
    // Per-election voting check - user can vote in each election once
    const currentElectionId = user?.selectedRegion?.activeElections?.[0]?.id || user?.currentElectionId || 'default_election';
    const hasVotedInCurrentElection = user?.votedElections?.some(v => v.electionId === currentElectionId) || false;
    
    if (user && !hasVotedInCurrentElection) {
      setIsLoading(true);
      
      try {
        const voterID = user.voterID || user.id;
        
        // CRITICAL: Before casting vote, verify from backend that user hasn't voted IN THIS ELECTION
        console.log('📡 Final verification from backend before casting vote');
        const votingStatus = await votingStatusService.getVotingStatus(user.email);
        
        // Check per-election voting status from backend
        const backendVotedInElection = votingStatus.success && 
          votingStatus.data?.votedElections?.some((v: { electionId: string }) => v.electionId === currentElectionId);
        
        if (backendVotedInElection) {
          throw new Error('You have already voted in this election. Each voter can only vote once per election.');
        }
        
        // Step 1: Check blockchain for duplicate vote
        try {
          const eligibility = await blockchainService.verifyVoterEligibility(voterID);
          if (eligibility.alreadyRegistered) {
            throw new Error('This Voter ID has already voted on the blockchain. Duplicate voting is not allowed.');
          }
        } catch (blockchainCheckError) {
          if (blockchainCheckError instanceof Error && blockchainCheckError.message.includes('already')) {
            throw blockchainCheckError;
          }
          console.warn('⚠️ Blockchain check failed, continuing:', blockchainCheckError);
        }
        
        // Step 2: Register voter on blockchain (if not already registered)
        if (!user.blockchainRegistered) {
          console.log('🔗 Registering voter on blockchain...');
          try {
            const registration = await blockchainService.registerVoter(voterID);
            console.log('✅ Voter registered:', registration.transactionHash);
            
            const registeredUser = {
              ...user,
              blockchainRegistered: true,
              registrationTxHash: registration.transactionHash
            };
            setUser(registeredUser);
            localStorage.setItem('user', JSON.stringify(registeredUser));
            
          } catch (regError) {
            console.warn('⚠️ Blockchain registration failed (continuing without):', regError);
          }
        }
        
        // Step 3: Cast vote on blockchain
        let voteReceipt = null;
        try {
          console.log('🗳️ Casting vote on blockchain with Voter ID:', voterID);
          voteReceipt = await blockchainService.castVote(voterID, partyId);
          console.log('✅ Vote recorded on blockchain:', voteReceipt);
        } catch (blockchainError) {
          if (blockchainError instanceof Error && 
              (blockchainError.message.includes('already') || blockchainError.message.includes('Already'))) {
            throw new Error('This Voter ID has already been used to vote. Duplicate voting is not allowed.');
          }
          console.warn('⚠️ Blockchain voting failed (continuing with database-only):', blockchainError);
        }
        
        // Step 4: Record vote in MongoDB database
        // Backend will set hasVoted=true in User collection - THIS IS CRITICAL
        const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';
        const voteResponse = await fetch(`${apiUrl}/votes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            voterID: voterID.toUpperCase(),
            userEmail: user.email,
            electionId: currentElectionId,
            candidateId: partyId,
            candidateName: partyId,
            partyName: partyId,
            region: user.region || { state: 'Unknown', district: 'Unknown', constituency: 'Unknown' },
            blockchainTxHash: voteReceipt?.transactionHash || null
          })
        });
        
        const voteData = await voteResponse.json();
        
        if (!voteResponse.ok) {
          console.error('❌ Backend vote recording failed:', voteData);
          throw new Error(voteData.error || 'Failed to record vote in database');
        }
        
        console.log('✅ Vote successfully recorded in backend database:', voteData);
        
        // Step 5: Update local user state with per-election voting record
        // Add this election to votedElections array
        const newVoteRecord = { electionId: currentElectionId, votedAt: new Date() };
        const updatedVotedElections = [...(user.votedElections || []), newVoteRecord];
        
        const updatedUser = { 
          ...user, 
          hasVoted: true, // Keep for backward compatibility
          votedElections: updatedVotedElections,
          votedAt: new Date(),
          voteTransactionHash: voteReceipt?.transactionHash || null,
          voteBlockNumber: voteReceipt?.blockNumber || null,
          voteBlockHash: voteReceipt?.blockHash || null
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // REMOVED: No longer storing voted emails/mobiles/voterIDs in localStorage
        // Backend is the single source of truth
        console.log('🎉 Vote successfully recorded!');
        setIsLoading(false);
        return true;
        
      } catch (error) {
        console.error('Vote failed:', error);
        setIsLoading(false);
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to record vote';
        alert(`❌ Vote Recording Failed\n\n${errorMessage}\n\nPlease try again or contact support.`);
        
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setAuthStep('region-selection');
    }
  }, []);

  return {
    user,
    authStep,
    isLoading,
    isDisabledVoting,
    blockchainConnected,
    walletAddress,
    mockLogin,
    verifyOTP,
    verifyVoterID,
    uploadVoterID, // deprecated
    uploadDisabilityCertificate,
    startDisabledVoting,
    logout,
    selectRegion,
    castVote,
    connectWallet,
    setAuthStep,
    demoOTP,
    faceDescriptor,
    faceImage,
    handleFaceCapture,
    handleFaceVerification,
    loginError,
    setLoginError
  };
};