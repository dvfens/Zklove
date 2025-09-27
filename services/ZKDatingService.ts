import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';
import type {
  DatingProfile,
  AnonymousCard,
  Match,
  SwipeAction,
  CompatibilityProof,
  ZKProof,
  AuraTransaction,
  EncryptedMessage,
  ContractProfile,
  ContractMatch
} from '../types/dating';

/**
 * ZK Dating Service
 * Handles all blockchain interactions for the zero-knowledge dating app
 */
class ZKDatingService {
  private static instance: ZKDatingService;
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private userAddress: string | null = null;

  // Contract ABI (simplified - in production use full ABI)
  private contractABI = [
    // Profile management
    "function createProfile(bytes32 _profileCommitment, bytes32 _locationCommitment, bytes32 _hobbiesCommitment, bytes32 _ageCommitment, bytes32 _nullifierHash, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _profileProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _locationProof, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _hobbiesProof) external",
    "function getProfile(address user) external view returns (tuple(bytes32 profileCommitment, bytes32 locationCommitment, bytes32 hobbiesCommitment, bytes32 ageCommitment, bytes32 nullifierHash, uint256 auraBalance, uint256 totalMatches, uint256 successfulChats, bool isActive, uint256 createdAt, uint256 lastActiveAt))",
    
    // Matching and swiping
    "function swipe(address _target, bool _isLike, tuple(uint256[2] a, uint256[2][2] b, uint256[2] c) _compatibilityProof, uint8 _compatibilityScore) external",
    "function getMatch(address user1, address user2) external view returns (tuple(address user1, address user2, bool user1Liked, bool user2Liked, bool isMatched, bool chatUnlocked, uint256 matchedAt, uint256 chatUnlockedAt, bytes32 sharedSecretHash, uint8 compatibilityScore))",
    "function getUserMatches(address user) external view returns (bytes32[] memory)",
    
    // Aura and unlocking
    "function unlockChat(address _matchedUser) external",
    "function unlockDetails(address _target, string memory _tier) external", 
    "function getAuraBalance(address user) external view returns (uint256)",
    "function getAuraTransactions(address user) external view returns (tuple(address user, int256 amount, string reason, uint256 timestamp, bytes32 relatedMatchId)[] memory)",
    
    // Messaging
    "function postMessage(address _recipient, bytes32 _encryptedMessageHash) external",
    "function getMatchMessages(bytes32 matchId) external view returns (bytes32[] memory)",
    
    // Events
    "event ProfileCreated(address indexed user, bytes32 profileCommitment, uint256 auraAwarded)",
    "event SwipeRecorded(address indexed swiper, address indexed target, bool isLike, uint8 compatibilityScore)",
    "event MatchCreated(address indexed user1, address indexed user2, bytes32 matchId, uint256 timestamp)",
    "event ChatUnlocked(address indexed user1, address indexed user2, bytes32 matchId)",
    "event AuraEarned(address indexed user, uint256 amount, string reason, bytes32 relatedMatch)",
    "event MessagePosted(bytes32 indexed matchId, bytes32 messageHash, address sender, uint256 timestamp)"
  ];

  static getInstance(): ZKDatingService {
    if (!ZKDatingService.instance) {
      ZKDatingService.instance = new ZKDatingService();
    }
    return ZKDatingService.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing ZK Dating Service...');
      
      // Initialize provider
      const rpcUrl = config.blockchain.testnet 
        ? config.blockchain.rpcUrls.polygon.mumbai
        : config.blockchain.rpcUrls.polygon.mainnet;
        
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize contract
      const contractAddress = config.blockchain.contracts.zkDating || '0x1234567890123456789012345678901234567890';
      this.contract = new ethers.Contract(contractAddress, this.contractABI, this.provider);
      
      console.log('ZK Dating Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ZK Dating Service:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<string> {
    try {
      // In React Native, this would connect to a wallet provider
      // For now, we'll use a stored private key (DEMO ONLY)
      const privateKey = await AsyncStorage.getItem('wallet_private_key');
      if (!privateKey) {
        throw new Error('No wallet found. Please create or import a wallet.');
      }
      
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.userAddress = await this.signer.getAddress();
      
      if (this.contract) {
        this.contract = this.contract.connect(this.signer);
      }
      
      console.log('Wallet connected:', this.userAddress);
      return this.userAddress;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async createProfile(profile: DatingProfile): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Service not initialized or wallet not connected');
    }

    try {
      console.log('Creating dating profile on-chain...');
      
      const tx = await this.contract.createProfile(
        profile.commitments.profileCommitment,
        profile.commitments.locationCommitment,
        profile.commitments.hobbiesCommitment,
        profile.commitments.ageCommitment,
        profile.commitments.nullifierHash,
        this.formatProofForContract(profile.profileProof!),
        this.formatProofForContract(profile.locationProof!),
        this.formatProofForContract(profile.hobbiesProof!)
      );
      
      console.log('Profile creation transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      // Store profile locally
      await this.storeProfileLocally(profile);
      
      console.log('Profile created successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  async swipeUser(swipeAction: SwipeAction): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Service not initialized or wallet not connected');
    }

    try {
      console.log('Recording swipe on-chain...');
      
      const compatibilityProof = swipeAction.isLike && swipeAction.compatibilityProof
        ? this.formatProofForContract(swipeAction.compatibilityProof.proof)
        : { a: [0, 0], b: [[0, 0], [0, 0]], c: [0, 0] }; // Empty proof for passes
      
      const compatibilityScore = swipeAction.compatibilityProof?.publicSignals.compatibilityScore || 0;
      
      const tx = await this.contract.swipe(
        swipeAction.targetUser,
        swipeAction.isLike,
        compatibilityProof,
        compatibilityScore
      );
      
      console.log('Swipe transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      console.log('Swipe recorded successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Failed to record swipe:', error);
      throw error;
    }
  }

  async unlockChat(matchedUserAddress: string): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Service not initialized or wallet not connected');
    }

    try {
      console.log('Unlocking chat...');
      
      const tx = await this.contract.unlockChat(matchedUserAddress);
      console.log('Chat unlock transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Chat unlocked successfully:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('Failed to unlock chat:', error);
      throw error;
    }
  }

  async unlockDetails(targetAddress: string, tier: string): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Service not initialized or wallet not connected');
    }

    try {
      console.log(`Unlocking ${tier} details...`);
      
      const tx = await this.contract.unlockDetails(targetAddress, tier);
      console.log('Details unlock transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Details unlocked successfully:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('Failed to unlock details:', error);
      throw error;
    }
  }

  async postMessage(recipientAddress: string, encryptedMessageHash: string): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Service not initialized or wallet not connected');
    }

    try {
      console.log('Posting message to blockchain...');
      
      const tx = await this.contract.postMessage(recipientAddress, encryptedMessageHash);
      console.log('Message transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Message posted successfully:', receipt.hash);
      
      return receipt.hash;
    } catch (error) {
      console.error('Failed to post message:', error);
      throw error;
    }
  }

  async getProfile(userAddress?: string): Promise<DatingProfile | null> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      const address = userAddress || this.userAddress;
      if (!address) {
        throw new Error('No user address provided');
      }

      const contractProfile: ContractProfile = await this.contract.getProfile(address);
      
      if (!contractProfile.isActive) {
        return null;
      }

      // Get local profile data
      const localProfile = await this.getProfileLocally(address);
      
      return {
        ...localProfile,
        auraBalance: Number(contractProfile.auraBalance),
        totalMatches: Number(contractProfile.totalMatches),
        successfulChats: Number(contractProfile.successfulChats),
        isActive: contractProfile.isActive,
        createdAt: Number(contractProfile.createdAt),
        lastActiveAt: Number(contractProfile.lastActiveAt),
        commitments: {
          profileCommitment: contractProfile.profileCommitment,
          locationCommitment: contractProfile.locationCommitment,
          hobbiesCommitment: contractProfile.hobbiesCommitment,
          ageCommitment: contractProfile.ageCommitment,
          nullifierHash: contractProfile.nullifierHash
        }
      };
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  async getMatches(): Promise<Match[]> {
    if (!this.contract || !this.userAddress) {
      throw new Error('Service not initialized or wallet not connected');
    }

    try {
      const matchIds: string[] = await this.contract.getUserMatches(this.userAddress);
      const matches: Match[] = [];

      for (const matchId of matchIds) {
        // Get match details by reconstructing user addresses from matchId
        // This is a simplified approach - in production, you'd store this mapping
        const contractMatch: ContractMatch = await this.contract.getMatch(this.userAddress, matchId);
        
        matches.push({
          matchId,
          user1: contractMatch.user1,
          user2: contractMatch.user2,
          user1Liked: contractMatch.user1Liked,
          user2Liked: contractMatch.user2Liked,
          isMatched: contractMatch.isMatched,
          chatUnlocked: contractMatch.chatUnlocked,
          matchedAt: Number(contractMatch.matchedAt),
          chatUnlockedAt: contractMatch.chatUnlockedAt ? Number(contractMatch.chatUnlockedAt) : undefined,
          sharedSecretHash: contractMatch.sharedSecretHash,
          compatibilityScore: contractMatch.compatibilityScore
        });
      }

      return matches;
    } catch (error) {
      console.error('Failed to get matches:', error);
      return [];
    }
  }

  async getAuraBalance(userAddress?: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      const address = userAddress || this.userAddress;
      if (!address) {
        throw new Error('No user address provided');
      }

      const balance = await this.contract.getAuraBalance(address);
      return Number(balance);
    } catch (error) {
      console.error('Failed to get aura balance:', error);
      return 0;
    }
  }

  async getAuraTransactions(userAddress?: string): Promise<AuraTransaction[]> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      const address = userAddress || this.userAddress;
      if (!address) {
        throw new Error('No user address provided');
      }

      const transactions = await this.contract.getAuraTransactions(address);
      
      return transactions.map((tx: any) => ({
        user: tx.user,
        amount: Number(tx.amount),
        reason: tx.reason,
        timestamp: Number(tx.timestamp),
        relatedMatchId: tx.relatedMatchId !== '0x0000000000000000000000000000000000000000000000000000000000000000' 
          ? tx.relatedMatchId 
          : undefined
      }));
    } catch (error) {
      console.error('Failed to get aura transactions:', error);
      return [];
    }
  }

  // Helper methods
  private formatProofForContract(proof: ZKProof): any {
    return {
      a: proof.a,
      b: proof.b,
      c: proof.c
    };
  }

  private async storeProfileLocally(profile: DatingProfile): Promise<void> {
    const key = `dating_profile_${this.userAddress}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      name: profile.name,
      bio: profile.bio,
      avatarUri: profile.avatarUri,
      city: profile.city,
      coordinates: profile.coordinates,
      hobbies: profile.hobbies,
      age: profile.age,
      minAge: profile.minAge,
      maxAge: profile.maxAge
    }));
  }

  private async getProfileLocally(userAddress: string): Promise<Partial<DatingProfile>> {
    try {
      const key = `dating_profile_${userAddress}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get local profile:', error);
      return {};
    }
  }

  // Event listeners
  async subscribeToEvents(callbacks: {
    onProfileCreated?: (event: any) => void;
    onSwipeRecorded?: (event: any) => void;
    onMatchCreated?: (event: any) => void;
    onChatUnlocked?: (event: any) => void;
    onAuraEarned?: (event: any) => void;
    onMessagePosted?: (event: any) => void;
  }): Promise<void> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    if (callbacks.onProfileCreated) {
      this.contract.on('ProfileCreated', callbacks.onProfileCreated);
    }
    
    if (callbacks.onSwipeRecorded) {
      this.contract.on('SwipeRecorded', callbacks.onSwipeRecorded);
    }
    
    if (callbacks.onMatchCreated) {
      this.contract.on('MatchCreated', callbacks.onMatchCreated);
    }
    
    if (callbacks.onChatUnlocked) {
      this.contract.on('ChatUnlocked', callbacks.onChatUnlocked);
    }
    
    if (callbacks.onAuraEarned) {
      this.contract.on('AuraEarned', callbacks.onAuraEarned);
    }
    
    if (callbacks.onMessagePosted) {
      this.contract.on('MessagePosted', callbacks.onMessagePosted);
    }
  }

  async unsubscribeFromEvents(): Promise<void> {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  getUserAddress(): string | null {
    return this.userAddress;
  }

  isInitialized(): boolean {
    return this.contract !== null;
  }

  isConnected(): boolean {
    return this.signer !== null && this.userAddress !== null;
  }
}

export default ZKDatingService;
