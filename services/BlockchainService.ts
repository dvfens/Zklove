import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import ConfigService from './ConfigService';
import MoproZKService, { ZKProof } from './MoproZKService';

// Smart contract ABI for identity verification
const IDENTITY_CONTRACT_ABI = [
  "function verifyIdentity(uint256[2] memory _pA, uint256[2][2] memory _pB, uint256[2] memory _pC, uint256[] memory _publicSignals) public returns (bool)",
  "function addToMerkleTree(bytes32 commitment) public",
  "function isNullifierUsed(bytes32 nullifier) public view returns (bool)",
  "function getMerkleRoot() public view returns (bytes32)",
  "function getVerificationCount(address user) public view returns (uint256)",
  "event IdentityVerified(address indexed user, bytes32 indexed commitment, uint256 timestamp)",
  "event MerkleTreeUpdated(bytes32 indexed root, uint256 leafCount)"
];

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  gasPrice?: string;
  gasLimit?: string;
}

export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface VerificationRecord {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  commitment: string;
  userAddress: string;
  gasUsed: string;
}

class BlockchainService {
  private static instance: BlockchainService;
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private config: BlockchainConfig | null = null;
  private moproService: MoproZKService;

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  constructor() {
    this.moproService = MoproZKService.getInstance();
  }

  // Initialize blockchain connection
  async initialize(config?: BlockchainConfig): Promise<void> {
    try {
      // Use provided config or load from ConfigService
      if (!config) {
        const configService = ConfigService.getInstance();
        config = configService.getBlockchainConfig();
      }
      
      this.config = config;
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      
      // Get or create wallet
      let privateKey = await AsyncStorage.getItem('zkLove_wallet_key');
      if (!privateKey) {
        try {
          const randomWallet = ethers.Wallet.createRandom();
          privateKey = randomWallet.privateKey;
          await AsyncStorage.setItem('zkLove_wallet_key', privateKey);
        } catch (randomError) {
          console.warn('Failed to create random wallet, using fallback method:', randomError);
          // Fallback: create wallet from a deterministic seed
          const fallbackSeed = 'zkLove_fallback_seed_' + Date.now().toString();
          const hash = ethers.keccak256(ethers.toUtf8Bytes(fallbackSeed));
          privateKey = hash;
          await AsyncStorage.setItem('zkLove_wallet_key', privateKey);
        }
      }
      
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Initialize contract
      this.contract = new ethers.Contract(
        config.contractAddress,
        IDENTITY_CONTRACT_ABI,
        this.wallet
      );

      console.log('Blockchain service initialized');
      console.log('Wallet address:', this.wallet.address);
      console.log('Contract address:', config.contractAddress);
      
      // Initialize Mopro service with blockchain config
      await this.moproService.initialize(config.rpcUrl, privateKey);
      
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  // Submit identity commitment to blockchain
  async submitIdentityCommitment(commitment: string): Promise<TransactionResult> {
    if (!this.contract || !this.wallet) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('Submitting identity commitment to blockchain...');
      
      const commitmentBytes32 = ethers.keccak256(ethers.toUtf8Bytes(commitment));
      
      const tx = await this.contract.addToMerkleTree(commitmentBytes32, {
        gasPrice: this.config?.gasPrice || undefined,
        gasLimit: this.config?.gasLimit || 500000
      });

      console.log('Transaction submitted:', tx.hash);

      const result: TransactionResult = {
        hash: tx.hash,
        status: 'pending'
      };

      // Wait for confirmation in background
      this.waitForConfirmation(tx.hash).then(receipt => {
        result.blockNumber = receipt.blockNumber;
        result.gasUsed = receipt.gasUsed.toString();
        result.status = 'confirmed';
        this.storeVerificationRecord(result, commitment);
      }).catch(error => {
        console.error('Transaction failed:', error);
        result.status = 'failed';
      });

      return result;
    } catch (error) {
      console.error('Failed to submit commitment:', error);
      throw error;
    }
  }

  // Verify identity proof on blockchain
  async verifyIdentityOnChain(zkProof: ZKProof): Promise<TransactionResult> {
    if (!this.contract || !this.wallet) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('Verifying identity proof on blockchain...');

      // Convert proof to contract format
      const pA = [zkProof.proof.a[0], zkProof.proof.a[1]];
      const pB = [
        [zkProof.proof.b[0][0], zkProof.proof.b[0][1]],
        [zkProof.proof.b[1][0], zkProof.proof.b[1][1]]
      ];
      const pC = [zkProof.proof.c[0], zkProof.proof.c[1]];
      const publicSignals = zkProof.publicSignals.map(signal => 
        ethers.getBigInt(ethers.keccak256(ethers.toUtf8Bytes(signal)))
      );

      const tx = await this.contract.verifyIdentity(pA, pB, pC, publicSignals, {
        gasPrice: this.config?.gasPrice || undefined,
        gasLimit: this.config?.gasLimit || 800000
      });

      console.log('Verification transaction submitted:', tx.hash);

      const result: TransactionResult = {
        hash: tx.hash,
        status: 'pending'
      };

      // Wait for confirmation
      this.waitForConfirmation(tx.hash).then(receipt => {
        result.blockNumber = receipt.blockNumber;
        result.gasUsed = receipt.gasUsed.toString();
        result.status = 'confirmed';
        
        // Store verification record
        this.storeVerificationRecord(result, zkProof.commitmentHash);
      }).catch(error => {
        console.error('Verification transaction failed:', error);
        result.status = 'failed';
      });

      return result;
    } catch (error) {
      console.error('Failed to verify on chain:', error);
      throw error;
    }
  }

  // Check if nullifier has been used
  async isNullifierUsed(nullifierHash: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const nullifierBytes32 = ethers.keccak256(ethers.toUtf8Bytes(nullifierHash));
      return await this.contract.isNullifierUsed(nullifierBytes32);
    } catch (error) {
      console.error('Failed to check nullifier:', error);
      return false;
    }
  }

  // Get current merkle root from contract
  async getMerkleRoot(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const root = await this.contract.getMerkleRoot();
      return root;
    } catch (error) {
      console.error('Failed to get merkle root:', error);
      throw error;
    }
  }

  // Get user verification count
  async getVerificationCount(address?: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const userAddress = address || this.wallet?.address;
      if (!userAddress) {
        throw new Error('No address available');
      }

      const count = await this.contract.getVerificationCount(userAddress);
      return Number(count);
    } catch (error) {
      console.error('Failed to get verification count:', error);
      return 0;
    }
  }

  // Listen to contract events
  setupEventListeners(): void {
    if (!this.contract) {
      console.warn('Contract not initialized, cannot setup event listeners');
      return;
    }

    // Listen for identity verification events
    this.contract.on('IdentityVerified', (user, commitment, timestamp, event) => {
      console.log('Identity verified event:', {
        user,
        commitment,
        timestamp: new Date(Number(timestamp) * 1000),
        txHash: event.transactionHash
      });
      
      // Store event data locally
      this.storeEventData('IdentityVerified', {
        user,
        commitment,
        timestamp: Number(timestamp),
        txHash: event.transactionHash
      });
    });

    // Listen for merkle tree updates
    this.contract.on('MerkleTreeUpdated', (root, leafCount, event) => {
      console.log('Merkle tree updated:', {
        root,
        leafCount: Number(leafCount),
        txHash: event.transactionHash
      });
      
      this.storeEventData('MerkleTreeUpdated', {
        root,
        leafCount: Number(leafCount),
        txHash: event.transactionHash
      });
    });
  }

  // Get wallet balance
  async getBalance(): Promise<string> {
    if (!this.wallet || !this.provider) {
      throw new Error('Wallet not initialized');
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  // Get network info
  async getNetworkInfo(): Promise<{chainId: number; name: string; blockNumber: number}> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw error;
    }
  }

  // Batch operations for efficiency
  async batchVerifyIdentities(zkProofs: ZKProof[]): Promise<TransactionResult[]> {
    console.log(`Starting batch verification of ${zkProofs.length} proofs...`);
    
    const results: TransactionResult[] = [];
    const batchSize = 5; // Process in batches to avoid gas limits
    
    for (let i = 0; i < zkProofs.length; i += batchSize) {
      const batch = zkProofs.slice(i, i + batchSize);
      const batchPromises = batch.map(proof => this.verifyIdentityOnChain(proof));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Wait between batches to avoid rate limiting
        if (i + batchSize < zkProofs.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error);
        // Add failed results
        const failedResults = batch.map(() => ({
          hash: '',
          status: 'failed' as const
        }));
        results.push(...failedResults);
      }
    }
    
    return results;
  }

  // Private helper methods
  private async waitForConfirmation(txHash: string): Promise<ethers.TransactionReceipt> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    console.log(`Waiting for confirmation of ${txHash}...`);
    const receipt = await this.provider.waitForTransaction(txHash, 1, 60000); // 1 minute timeout
    
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }
    
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    return receipt;
  }

  private async storeVerificationRecord(
    result: TransactionResult, 
    commitment: string
  ): Promise<void> {
    try {
      const record: VerificationRecord = {
        txHash: result.hash,
        blockNumber: result.blockNumber || 0,
        timestamp: Date.now(),
        commitment,
        userAddress: this.wallet?.address || '',
        gasUsed: result.gasUsed || '0'
      };

      const key = `verification_${result.hash}`;
      await AsyncStorage.setItem(key, JSON.stringify(record));
    } catch (error) {
      console.error('Failed to store verification record:', error);
    }
  }

  private async storeEventData(eventName: string, data: any): Promise<void> {
    try {
      const key = `event_${eventName}_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        event: eventName,
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to store event data:', error);
    }
  }

  // Public utility methods
  async getVerificationHistory(): Promise<VerificationRecord[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const verificationKeys = keys.filter(key => key.startsWith('verification_'));
      const records = await AsyncStorage.multiGet(verificationKeys);
      
      return records
        .filter(([_, value]) => value !== null)
        .map(([_, value]) => JSON.parse(value!))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get verification history:', error);
      return [];
    }
  }

  async getEventHistory(): Promise<any[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const eventKeys = keys.filter(key => key.startsWith('event_'));
      const events = await AsyncStorage.multiGet(eventKeys);
      
      return events
        .filter(([_, value]) => value !== null)
        .map(([_, value]) => JSON.parse(value!))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get event history:', error);
      return [];
    }
  }

  // Cleanup methods
  async clearBlockchainData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const blockchainKeys = keys.filter(key => 
        key.startsWith('verification_') || 
        key.startsWith('event_')
      );
      await AsyncStorage.multiRemove(blockchainKeys);
      console.log('Blockchain data cleared');
    } catch (error) {
      console.error('Failed to clear blockchain data:', error);
    }
  }

  // Getters
  get walletAddress(): string | null {
    return this.wallet?.address || null;
  }

  get contractAddress(): string {
    return this.config?.contractAddress || '';
  }

  get isInitialized(): boolean {
    return !!(this.provider && this.wallet && this.contract);
  }
}

export default BlockchainService;
