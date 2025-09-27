// Zero-Knowledge Dating App Types

export type Hobby = 
  | 'music' 
  | 'fitness' 
  | 'art' 
  | 'coding' 
  | 'gaming' 
  | 'travel' 
  | 'food' 
  | 'reading' 
  | 'movies' 
  | 'sports'
  | 'photography'
  | 'cooking'
  | 'dancing'
  | 'hiking'
  | 'yoga';

export interface ZKProof {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
  publicSignals: string[];
}

export interface ProfileCommitments {
  profileCommitment: string;     // commitment(name, bio, avatar_hash)
  locationCommitment: string;    // commitment(city, lat, lng) 
  hobbiesCommitment: string;     // commitment(hobbies_array)
  ageCommitment: string;         // commitment(age, min_age, max_age)
  nullifierHash: string;         // unique identity proof
}

export interface DatingProfile {
  // Private data (stored locally, never shared)
  name: string;
  bio: string;
  avatarUri?: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  hobbies: Hobby[];
  age: number;
  minAge: number;
  maxAge: number;
  
  // On-chain commitments and public data
  commitments: ProfileCommitments;
  auraBalance: number;
  totalMatches: number;
  successfulChats: number;
  isActive: boolean;
  createdAt: number;
  lastActiveAt: number;
  
  // ZK proofs for commitments
  profileProof?: ZKProof;
  locationProof?: ZKProof;
  hobbiesProof?: ZKProof;
  ageProof?: ZKProof;
}

export interface AnonymousCard {
  id: string;                    // user address
  cityMatch: boolean;            // proven via ZK
  sharedHobbyCount: number;      // proven via ZK  
  compatibilityScore: number;    // 0-100 from ZK proof
  estimatedAge?: string;         // age range like "20-25"
  auraRequiredToUnlock: {
    basic: number;    // name + 1 hobby
    bio: number;      // bio + more hobbies
    avatar: number;   // profile picture
    contact: number;  // chat unlock
  };
}

export interface Match {
  matchId: string;
  user1: string;
  user2: string;
  user1Liked: boolean;
  user2Liked: boolean;
  isMatched: boolean;
  chatUnlocked: boolean;
  matchedAt: number;
  chatUnlockedAt?: number;
  sharedSecretHash?: string;
  compatibilityScore: number;
}

export interface AuraTransaction {
  user: string;
  amount: number;               // positive = earned, negative = spent
  reason: string;
  timestamp: number;
  relatedMatchId?: string;
}

export interface EncryptedMessage {
  messageHash: string;          // stored on-chain
  encryptedContent: string;     // stored off-chain (IPFS)
  sender: string;
  timestamp: number;
  matchId: string;
}

export interface CompatibilityProof {
  proof: ZKProof;
  publicSignals: {
    isCompatible: boolean;
    compatibilityScore: number;
    user1LocationCommitment: string;
    user2LocationCommitment: string;
    user1HobbiesCommitment: string;
    user2HobbiesCommitment: string;
  };
}

export interface SwipeAction {
  targetUser: string;
  isLike: boolean;
  compatibilityProof?: CompatibilityProof;
  timestamp: number;
}

export interface UnlockTier {
  tier: 'basic' | 'bio' | 'avatar' | 'contact';
  cost: number;
  description: string;
  includes: string[];
}

export interface DatingStats {
  totalProfiles: number;
  totalMatches: number;
  totalMessages: number;
  averageCompatibilityScore: number;
  topHobbies: { hobby: Hobby; count: number }[];
  topCities: { city: string; count: number }[];
}

// Contract interaction types
export interface ContractProfile {
  profileCommitment: string;
  locationCommitment: string;
  hobbiesCommitment: string;
  ageCommitment: string;
  nullifierHash: string;
  auraBalance: bigint;
  totalMatches: bigint;
  successfulChats: bigint;
  isActive: boolean;
  createdAt: bigint;
  lastActiveAt: bigint;
}

export interface ContractMatch {
  user1: string;
  user2: string;
  user1Liked: boolean;
  user2Liked: boolean;
  isMatched: boolean;
  chatUnlocked: boolean;
  matchedAt: bigint;
  chatUnlockedAt: bigint;
  sharedSecretHash: string;
  compatibilityScore: number;
}

// Event types for contract events
export interface ProfileCreatedEvent {
  user: string;
  profileCommitment: string;
  auraAwarded: number;
}

export interface SwipeRecordedEvent {
  swiper: string;
  target: string;
  isLike: boolean;
  compatibilityScore: number;
}

export interface MatchCreatedEvent {
  user1: string;
  user2: string;
  matchId: string;
  timestamp: number;
}

export interface ChatUnlockedEvent {
  user1: string;
  user2: string;
  matchId: string;
}

export interface AuraEarnedEvent {
  user: string;
  amount: number;
  reason: string;
  relatedMatch?: string;
}

export interface MessagePostedEvent {
  matchId: string;
  messageHash: string;
  sender: string;
  timestamp: number;
}
