import AsyncStorage from '@react-native-async-storage/async-storage';

// IPFS-like decentralized storage simulation
// In production, this would integrate with actual IPFS nodes or Pinata/Infura

export interface IPFSFile {
  hash: string;
  name: string;
  size: number;
  type: string;
  content: string;
  timestamp: number;
  pinned: boolean;
}

export interface IPFSUploadResult {
  hash: string;
  size: number;
  url: string;
  gateway: string;
}

export interface IPFSNode {
  id: string;
  addresses: string[];
  status: 'online' | 'offline';
  latency: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  pinnedFiles: number;
  unpinnedFiles: number;
}

class IPFSService {
  private static instance: IPFSService;
  private nodes: IPFSNode[] = [];
  private isInitialized: boolean = false;
  private defaultGateway: string = 'https://ipfs.io/ipfs/';

  static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  // Initialize IPFS service
  async initialize(customGateway?: string): Promise<void> {
    try {
      if (customGateway) {
        this.defaultGateway = customGateway;
      }

      // Initialize with default IPFS nodes (simulated)
      this.nodes = [
        {
          id: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
          addresses: ['ipfs.io', 'dweb.link', 'cf-ipfs.com'],
          status: 'online',
          latency: 150
        },
        {
          id: 'QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
          addresses: ['gateway.pinata.cloud', 'infura-ipfs.io'],
          status: 'online',
          latency: 200
        }
      ];

      this.isInitialized = true;
      console.log('IPFS Service initialized with', this.nodes.length, 'nodes');
    } catch (error) {
      console.error('Failed to initialize IPFS service:', error);
      throw error;
    }
  }

  // Upload file to IPFS (simulated)
  async uploadFile(
    content: string | Uint8Array, 
    filename: string, 
    type: string = 'application/octet-stream'
  ): Promise<IPFSUploadResult> {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      // Convert content to string for hashing
      const contentStr = typeof content === 'string' ? content : Buffer.from(content).toString('base64');
      
      // Generate IPFS-like hash (in reality, this would be a proper multihash)
      const hash = this.generateIPFSHash(contentStr);
      const size = contentStr.length;

      // Create file object
      const ipfsFile: IPFSFile = {
        hash,
        name: filename,
        size,
        type,
        content: contentStr,
        timestamp: Date.now(),
        pinned: true // Auto-pin uploaded files
      };

      // Store locally (simulating IPFS storage)
      await this.storeFile(ipfsFile);

      // Simulate network upload delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const result: IPFSUploadResult = {
        hash,
        size,
        url: `${this.defaultGateway}${hash}`,
        gateway: this.defaultGateway
      };

      console.log('File uploaded to IPFS:', hash);
      return result;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  // Upload JSON data
  async uploadJSON(data: any, filename?: string): Promise<IPFSUploadResult> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const name = filename || `data_${Date.now()}.json`;
      
      return await this.uploadFile(jsonContent, name, 'application/json');
    } catch (error) {
      console.error('Failed to upload JSON to IPFS:', error);
      throw error;
    }
  }

  // Download file from IPFS
  async downloadFile(hash: string): Promise<IPFSFile | null> {
    try {
      // Try to get from local storage first
      const localFile = await this.getLocalFile(hash);
      if (localFile) {
        return localFile;
      }

      // Simulate network download
      console.log('Downloading from IPFS network:', hash);
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

      // In reality, this would fetch from IPFS network
      // For simulation, return null if not found locally
      return null;
    } catch (error) {
      console.error('Failed to download file from IPFS:', error);
      return null;
    }
  }

  // Pin file to ensure it stays available
  async pinFile(hash: string): Promise<boolean> {
    try {
      const file = await this.getLocalFile(hash);
      if (!file) {
        throw new Error('File not found');
      }

      file.pinned = true;
      await this.storeFile(file);

      console.log('File pinned:', hash);
      return true;
    } catch (error) {
      console.error('Failed to pin file:', error);
      return false;
    }
  }

  // Unpin file
  async unpinFile(hash: string): Promise<boolean> {
    try {
      const file = await this.getLocalFile(hash);
      if (!file) {
        throw new Error('File not found');
      }

      file.pinned = false;
      await this.storeFile(file);

      console.log('File unpinned:', hash);
      return true;
    } catch (error) {
      console.error('Failed to unpin file:', error);
      return false;
    }
  }

  // List all files
  async listFiles(): Promise<IPFSFile[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const ipfsKeys = keys.filter(key => key.startsWith('ipfs_'));
      const files = await AsyncStorage.multiGet(ipfsKeys);
      
      return files
        .filter(([_, value]) => value !== null)
        .map(([_, value]) => JSON.parse(value!))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<StorageStats> {
    try {
      const files = await this.listFiles();
      
      return {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        pinnedFiles: files.filter(file => file.pinned).length,
        unpinnedFiles: files.filter(file => !file.pinned).length
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        pinnedFiles: 0,
        unpinnedFiles: 0
      };
    }
  }

  // Upload identity verification data
  async uploadVerificationData(
    faceData: any,
    idData: any,
    zkProof: any
  ): Promise<{
    faceHash: string;
    idHash: string;
    proofHash: string;
    manifestHash: string;
  }> {
    try {
      // Upload individual components
      const faceResult = await this.uploadJSON(faceData, 'face_verification.json');
      const idResult = await this.uploadJSON(idData, 'id_verification.json');
      const proofResult = await this.uploadJSON(zkProof, 'zk_proof.json');

      // Create manifest file linking all components
      const manifest = {
        type: 'identity_verification',
        version: '1.0',
        timestamp: Date.now(),
        components: {
          face: {
            hash: faceResult.hash,
            type: 'face_verification',
            size: faceResult.size
          },
          id: {
            hash: idResult.hash,
            type: 'id_verification',
            size: idResult.size
          },
          proof: {
            hash: proofResult.hash,
            type: 'zk_proof',
            size: proofResult.size
          }
        },
        metadata: {
          created: new Date().toISOString(),
          creator: 'zkLove_verification_system',
          integrity: this.calculateManifestHash([faceResult.hash, idResult.hash, proofResult.hash])
        }
      };

      const manifestResult = await this.uploadJSON(manifest, 'verification_manifest.json');

      return {
        faceHash: faceResult.hash,
        idHash: idResult.hash,
        proofHash: proofResult.hash,
        manifestHash: manifestResult.hash
      };
    } catch (error) {
      console.error('Failed to upload verification data:', error);
      throw error;
    }
  }

  // Download complete verification data
  async downloadVerificationData(manifestHash: string): Promise<{
    manifest: any;
    faceData: any;
    idData: any;
    zkProof: any;
  } | null> {
    try {
      // Download manifest first
      const manifestFile = await this.downloadFile(manifestHash);
      if (!manifestFile) {
        throw new Error('Manifest not found');
      }

      const manifest = JSON.parse(manifestFile.content);

      // Download individual components
      const [faceFile, idFile, proofFile] = await Promise.all([
        this.downloadFile(manifest.components.face.hash),
        this.downloadFile(manifest.components.id.hash),
        this.downloadFile(manifest.components.proof.hash)
      ]);

      if (!faceFile || !idFile || !proofFile) {
        throw new Error('Some verification components not found');
      }

      return {
        manifest,
        faceData: JSON.parse(faceFile.content),
        idData: JSON.parse(idFile.content),
        zkProof: JSON.parse(proofFile.content)
      };
    } catch (error) {
      console.error('Failed to download verification data:', error);
      return null;
    }
  }

  // Garbage collection - remove unpinned files older than specified days
  async garbageCollect(olderThanDays: number = 7): Promise<number> {
    try {
      const files = await this.listFiles();
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      
      let removedCount = 0;
      
      for (const file of files) {
        if (!file.pinned && file.timestamp < cutoffTime) {
          await this.removeFile(file.hash);
          removedCount++;
        }
      }

      console.log(`Garbage collection completed: removed ${removedCount} files`);
      return removedCount;
    } catch (error) {
      console.error('Failed to perform garbage collection:', error);
      return 0;
    }
  }

  // Check node status
  async checkNodeStatus(): Promise<IPFSNode[]> {
    try {
      // Simulate node health checks
      const updatedNodes = this.nodes.map(node => ({
        ...node,
        status: Math.random() > 0.1 ? 'online' : 'offline' as 'online' | 'offline',
        latency: Math.floor(Math.random() * 500) + 50
      }));

      this.nodes = updatedNodes;
      return updatedNodes;
    } catch (error) {
      console.error('Failed to check node status:', error);
      return this.nodes;
    }
  }

  // Private helper methods
  private generateIPFSHash(content: string): string {
    // Generate a hash that looks like an IPFS hash
    const hash = CryptoJS.SHA256(content).toString();
    return `Qm${hash.substring(0, 44)}`; // IPFS hashes typically start with Qm
  }

  private calculateManifestHash(hashes: string[]): string {
    const combined = hashes.sort().join('');
    return CryptoJS.SHA256(combined).toString();
  }

  private async storeFile(file: IPFSFile): Promise<void> {
    try {
      const key = `ipfs_${file.hash}`;
      await AsyncStorage.setItem(key, JSON.stringify(file));
    } catch (error) {
      console.error('Failed to store file locally:', error);
      throw error;
    }
  }

  private async getLocalFile(hash: string): Promise<IPFSFile | null> {
    try {
      const key = `ipfs_${hash}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get local file:', error);
      return null;
    }
  }

  private async removeFile(hash: string): Promise<void> {
    try {
      const key = `ipfs_${hash}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove file:', error);
      throw error;
    }
  }

  // Public utility methods
  getGatewayUrl(hash: string, gateway?: string): string {
    const gatewayUrl = gateway || this.defaultGateway;
    return `${gatewayUrl}${hash}`;
  }

  isValidHash(hash: string): boolean {
    // Basic IPFS hash validation
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
  }

  // Cleanup methods
  async clearAllFiles(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const ipfsKeys = keys.filter(key => key.startsWith('ipfs_'));
      await AsyncStorage.multiRemove(ipfsKeys);
      console.log('All IPFS files cleared');
    } catch (error) {
      console.error('Failed to clear IPFS files:', error);
    }
  }

  // Getters
  get gateway(): string {
    return this.defaultGateway;
  }

  get nodeCount(): number {
    return this.nodes.length;
  }

  get onlineNodes(): number {
    return this.nodes.filter(node => node.status === 'online').length;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }
}

export default IPFSService;
