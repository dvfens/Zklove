import AsyncStorage from '@react-native-async-storage/async-storage';
import { poseidon } from 'circomlibjs';
import type { ZKProof, DatingProfile, CompatibilityProof, Hobby } from '../types/dating';

/**
 * ZK Proof Service
 * Generates zero-knowledge proofs for the dating app
 */
class ZKProofService {
  private static instance: ZKProofService;
  
  // Circuit artifacts (in production, these would be loaded from IPFS/CDN)
  private circuits = {
    profileCommitment: {
      wasmUrl: 'https://your-cdn.com/profile_commitment.wasm',
      zkeyUrl: 'https://your-cdn.com/profile_commitment_final.zkey'
    },
    compatibilityCheck: {
      wasmUrl: 'https://your-cdn.com/compatibility_check.wasm', 
      zkeyUrl: 'https://your-cdn.com/compatibility_check_final.zkey'
    }
  };

  static getInstance(): ZKProofService {
    if (!ZKProofService.instance) {
      ZKProofService.instance = new ZKProofService();
    }
    return ZKProofService.instance;
  }

  /**
   * Generate profile commitment proof
   * Proves user has valid profile data without revealing it
   */
  async generateProfileCommitmentProof(
    name: string,
    bio: string,
    avatarUri: string,
    age: number,
    salt: string
  ): Promise<{ commitment: string; proof: ZKProof }> {
    try {
      console.log('Generating profile commitment proof...');
      
      // Hash the profile components
      const nameHash = this.hashString(name);
      const bioHash = this.hashString(bio);
      const avatarHash = this.hashString(avatarUri || '');
      
      // Create commitment using Poseidon hash
      const commitment = poseidon([nameHash, bioHash, avatarHash, age, this.hashString(salt)]);
      
      // Generate ZK proof (simplified - in production use snarkjs)
      const proof = await this.generateMockProof('profile_commitment', {
        name_hash: nameHash,
        bio_hash: bioHash,
        avatar_hash: avatarHash,
        age: age,
        salt: this.hashString(salt)
      });
      
      console.log('Profile commitment proof generated');
      return {
        commitment: commitment.toString(),
        proof
      };
    } catch (error) {
      console.error('Failed to generate profile commitment proof:', error);
      throw error;
    }
  }

  /**
   * Generate location commitment proof
   * Proves user has valid location without revealing exact coordinates
   */
  async generateLocationCommitmentProof(
    city: string,
    coordinates: { lat: number; lng: number },
    salt: string
  ): Promise<{ commitment: string; proof: ZKProof }> {
    try {
      console.log('Generating location commitment proof...');
      
      // Hash city and coordinates
      const cityHash = this.hashString(city);
      const latHash = this.hashNumber(coordinates.lat);
      const lngHash = this.hashNumber(coordinates.lng);
      
      // Create commitment
      const commitment = poseidon([cityHash, latHash, lngHash, this.hashString(salt)]);
      
      // Generate proof
      const proof = await this.generateMockProof('location_commitment', {
        city_hash: cityHash,
        lat: latHash,
        lng: lngHash,
        salt: this.hashString(salt)
      });
      
      console.log('Location commitment proof generated');
      return {
        commitment: commitment.toString(),
        proof
      };
    } catch (error) {
      console.error('Failed to generate location commitment proof:', error);
      throw error;
    }
  }

  /**
   * Generate hobbies commitment proof
   * Proves user has valid hobbies without revealing them
   */
  async generateHobbiesCommitmentProof(
    hobbies: Hobby[],
    salt: string
  ): Promise<{ commitment: string; proof: ZKProof }> {
    try {
      console.log('Generating hobbies commitment proof...');
      
      // Pad hobbies array to fixed size (5) and hash each hobby
      const paddedHobbies = [...hobbies.slice(0, 5)];
      while (paddedHobbies.length < 5) {
        paddedHobbies.push('' as Hobby);
      }
      
      const hobbyHashes = paddedHobbies.map(hobby => this.hashString(hobby));
      
      // Create commitment
      const commitment = poseidon([...hobbyHashes, this.hashString(salt)]);
      
      // Generate proof
      const proof = await this.generateMockProof('hobbies_commitment', {
        hobbies: hobbyHashes,
        salt: this.hashString(salt)
      });
      
      console.log('Hobbies commitment proof generated');
      return {
        commitment: commitment.toString(),
        proof
      };
    } catch (error) {
      console.error('Failed to generate hobbies commitment proof:', error);
      throw error;
    }
  }

  /**
   * Generate compatibility proof
   * Proves two users are compatible (same city + shared hobbies) without revealing data
   */
  async generateCompatibilityProof(
    myProfile: DatingProfile,
    targetProfile: DatingProfile
  ): Promise<CompatibilityProof> {
    try {
      console.log('Generating compatibility proof...');
      
      // Check actual compatibility
      const sameCity = myProfile.city === targetProfile.city;
      const sharedHobbies = this.getSharedHobbies(myProfile.hobbies, targetProfile.hobbies);
      const isCompatible = sameCity && sharedHobbies.length > 0;
      const compatibilityScore = Math.min(100, sharedHobbies.length * 20);
      
      if (!isCompatible) {
        throw new Error('Users are not compatible');
      }
      
      // Generate proof inputs
      const myHobbiesHashes = this.padAndHashHobbies(myProfile.hobbies);
      const targetHobbiesHashes = this.padAndHashHobbies(targetProfile.hobbies);
      
      // Generate ZK proof
      const proof = await this.generateMockProof('compatibility_check', {
        user1_city: this.hashString(myProfile.city),
        user1_hobbies: myHobbiesHashes,
        user2_city: this.hashString(targetProfile.city),
        user2_hobbies: targetHobbiesHashes,
        salt1: this.generateRandomSalt(),
        salt2: this.generateRandomSalt(),
        salt3: this.generateRandomSalt(),
        salt4: this.generateRandomSalt()
      });
      
      console.log('Compatibility proof generated');
      return {
        proof,
        publicSignals: {
          isCompatible,
          compatibilityScore,
          user1LocationCommitment: myProfile.commitments.locationCommitment,
          user2LocationCommitment: targetProfile.commitments.locationCommitment,
          user1HobbiesCommitment: myProfile.commitments.hobbiesCommitment,
          user2HobbiesCommitment: targetProfile.commitments.hobbiesCommitment
        }
      };
    } catch (error) {
      console.error('Failed to generate compatibility proof:', error);
      throw error;
    }
  }

  /**
   * Verify a ZK proof (simplified verification)
   */
  async verifyProof(proof: ZKProof, circuitType: string): Promise<boolean> {
    try {
      console.log(`Verifying ${circuitType} proof...`);
      
      // Simplified verification - check proof structure
      const hasValidStructure = 
        proof.a.length === 2 &&
        proof.b.length === 2 &&
        proof.b[0].length === 2 &&
        proof.b[1].length === 2 &&
        proof.c.length === 2 &&
        proof.publicSignals.length > 0;
      
      if (!hasValidStructure) {
        console.error('Invalid proof structure');
        return false;
      }
      
      // In production, this would use snarkjs.groth16.verify()
      console.log('Proof verification passed (mock)');
      return true;
    } catch (error) {
      console.error('Failed to verify proof:', error);
      return false;
    }
  }

  // Helper methods
  private hashString(input: string): bigint {
    // Simple hash function - in production use proper hashing
    let hash = 0n;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31n + BigInt(input.charCodeAt(i))) % (2n ** 254n);
    }
    return hash;
  }

  private hashNumber(input: number): bigint {
    return BigInt(Math.floor(input * 1000000)); // Convert to integer with 6 decimal places
  }

  private padAndHashHobbies(hobbies: Hobby[]): bigint[] {
    const paddedHobbies = [...hobbies.slice(0, 5)];
    while (paddedHobbies.length < 5) {
      paddedHobbies.push('' as Hobby);
    }
    return paddedHobbies.map(hobby => this.hashString(hobby));
  }

  private getSharedHobbies(hobbies1: Hobby[], hobbies2: Hobby[]): Hobby[] {
    return hobbies1.filter(hobby => hobbies2.includes(hobby));
  }

  private generateRandomSalt(): bigint {
    // Generate random salt
    const randomBytes = new Uint8Array(32);
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
    
    let salt = 0n;
    for (let i = 0; i < randomBytes.length; i++) {
      salt = salt * 256n + BigInt(randomBytes[i]);
    }
    
    return salt % (2n ** 254n);
  }

  /**
   * Generate mock proof for development
   * In production, this would use snarkjs to generate real proofs
   */
  private async generateMockProof(circuitType: string, inputs: any): Promise<ZKProof> {
    console.log(`Generating mock proof for ${circuitType}...`);
    
    // Mock proof generation - in production use snarkjs.groth16.fullProve()
    const mockProof: ZKProof = {
      a: [
        "0x" + Math.random().toString(16).substr(2, 64),
        "0x" + Math.random().toString(16).substr(2, 64)
      ],
      b: [
        [
          "0x" + Math.random().toString(16).substr(2, 64),
          "0x" + Math.random().toString(16).substr(2, 64)
        ],
        [
          "0x" + Math.random().toString(16).substr(2, 64),
          "0x" + Math.random().toString(16).substr(2, 64)
        ]
      ],
      c: [
        "0x" + Math.random().toString(16).substr(2, 64),
        "0x" + Math.random().toString(16).substr(2, 64)
      ],
      publicSignals: [
        "1", // is_valid
        "85", // compatibility_score or other public output
        Object.values(inputs)[0]?.toString() || "0"
      ]
    };
    
    // Store proof locally for debugging
    await AsyncStorage.setItem(
      `zk_proof_${circuitType}_${Date.now()}`,
      JSON.stringify({ inputs, proof: mockProof })
    );
    
    return mockProof;
  }

  /**
   * Load circuit artifacts (WASM and zkey files)
   */
  private async loadCircuitArtifacts(circuitType: string): Promise<{ wasm: ArrayBuffer; zkey: ArrayBuffer }> {
    try {
      const circuit = this.circuits[circuitType as keyof typeof this.circuits];
      if (!circuit) {
        throw new Error(`Unknown circuit type: ${circuitType}`);
      }

      // In production, fetch from IPFS or CDN
      // For now, return mock data
      const mockWasm = new ArrayBuffer(1024);
      const mockZkey = new ArrayBuffer(2048);
      
      return { wasm: mockWasm, zkey: mockZkey };
    } catch (error) {
      console.error(`Failed to load circuit artifacts for ${circuitType}:`, error);
      throw error;
    }
  }

  /**
   * Get commitment for existing profile data
   */
  async getProfileCommitment(profile: DatingProfile, salt?: string): Promise<string> {
    const usedSalt = salt || this.generateRandomSalt().toString();
    const result = await this.generateProfileCommitmentProof(
      profile.name,
      profile.bio,
      profile.avatarUri || '',
      profile.age,
      usedSalt
    );
    return result.commitment;
  }

  /**
   * Check if two profiles are compatible without generating proof
   */
  isCompatible(profile1: DatingProfile, profile2: DatingProfile): boolean {
    const sameCity = profile1.city === profile2.city;
    const sharedHobbies = this.getSharedHobbies(profile1.hobbies, profile2.hobbies);
    return sameCity && sharedHobbies.length > 0;
  }

  /**
   * Calculate compatibility score without generating proof
   */
  calculateCompatibilityScore(profile1: DatingProfile, profile2: DatingProfile): number {
    if (!this.isCompatible(profile1, profile2)) {
      return 0;
    }
    
    const sharedHobbies = this.getSharedHobbies(profile1.hobbies, profile2.hobbies);
    const baseScore = Math.min(100, sharedHobbies.length * 20);
    
    // Add age compatibility bonus
    const ageDiff = Math.abs(profile1.age - profile2.age);
    const ageBonus = Math.max(0, 10 - ageDiff); // Up to 10 bonus points for similar age
    
    return Math.min(100, baseScore + ageBonus);
  }
}

export default ZKProofService;
