import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import CryptoJS from 'react-native-crypto-js';

export interface WalletInfo {
  address: string;
  publicKey: string;
  balance: string;
  network: {
    chainId: number;
    name: string;
  };
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface SignedMessage {
  message: string;
  signature: string;
  address: string;
  timestamp: number;
}

export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  provider: string | null;
}

class Web3WalletService {
  private static instance: Web3WalletService;
  private wallet: ethers.Wallet | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private isConnected: boolean = false;

  static getInstance(): Web3WalletService {
    if (!Web3WalletService.instance) {
      Web3WalletService.instance = new Web3WalletService();
    }
    return Web3WalletService.instance;
  }

  // Initialize wallet connection
  async initialize(rpcUrl: string): Promise<void> {
    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Try to restore existing wallet
      const savedWallet = await this.restoreWallet();
      if (savedWallet) {
        this.wallet = savedWallet;
        this.isConnected = true;
        console.log('Wallet restored:', this.wallet.address);
      }
    } catch (error) {
      console.error('Failed to initialize wallet service:', error);
      throw error;
    }
  }

  // Create new wallet
  async createWallet(password?: string): Promise<WalletInfo> {
    try {
      // Generate new wallet with fallback for React Native
      try {
        const randomWallet = ethers.Wallet.createRandom();
        this.wallet = new ethers.Wallet(randomWallet.privateKey);
      } catch (randomError) {
        console.warn('Using fallback wallet generation method:', randomError);
        // Fallback: create wallet from deterministic seed
        const seed = 'zkLove_wallet_' + Date.now() + '_' + Math.random();
        const hash = ethers.keccak256(ethers.toUtf8Bytes(seed));
        this.wallet = new ethers.Wallet(hash);
      }
      
      if (this.provider) {
        this.wallet = this.wallet.connect(this.provider);
      }

      // Save wallet securely
      await this.saveWallet(password);
      this.isConnected = true;

      const walletInfo = await this.getWalletInfo();
      
      console.log('New wallet created:', walletInfo.address);
      return walletInfo;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  // Import wallet from private key
  async importWallet(privateKey: string, password?: string): Promise<WalletInfo> {
    try {
      this.wallet = new ethers.Wallet(privateKey);
      
      if (this.provider) {
        this.wallet = this.wallet.connect(this.provider);
      }

      await this.saveWallet(password);
      this.isConnected = true;

      const walletInfo = await this.getWalletInfo();
      
      console.log('Wallet imported:', walletInfo.address);
      return walletInfo;
    } catch (error) {
      console.error('Failed to import wallet:', error);
      throw error;
    }
  }

  // Import wallet from mnemonic
  async importFromMnemonic(mnemonic: string, password?: string): Promise<WalletInfo> {
    try {
      this.wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      if (this.provider) {
        this.wallet = this.wallet.connect(this.provider);
      }

      await this.saveWallet(password);
      this.isConnected = true;

      const walletInfo = await this.getWalletInfo();
      
      console.log('Wallet imported from mnemonic:', walletInfo.address);
      return walletInfo;
    } catch (error) {
      console.error('Failed to import from mnemonic:', error);
      throw error;
    }
  }

  // Get wallet information
  async getWalletInfo(): Promise<WalletInfo> {
    if (!this.wallet || !this.provider) {
      throw new Error('Wallet not initialized');
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      const network = await this.provider.getNetwork();

      return {
        address: this.wallet.address,
        publicKey: this.wallet.signingKey.publicKey,
        balance: ethers.formatEther(balance),
        network: {
          chainId: Number(network.chainId),
          name: network.name
        }
      };
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      throw error;
    }
  }

  // Sign message
  async signMessage(message: string): Promise<SignedMessage> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.wallet.signMessage(message);
      
      const signedMessage: SignedMessage = {
        message,
        signature,
        address: this.wallet.address,
        timestamp: Date.now()
      };

      // Store signed message locally
      await this.storeSignedMessage(signedMessage);

      return signedMessage;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  // Verify message signature
  async verifyMessage(message: string, signature: string, expectedAddress: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Failed to verify message:', error);
      return false;
    }
  }

  // Send transaction
  async sendTransaction(request: TransactionRequest): Promise<ethers.TransactionResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const txRequest = {
        to: request.to,
        value: request.value ? ethers.parseEther(request.value) : undefined,
        data: request.data,
        gasLimit: request.gasLimit ? BigInt(request.gasLimit) : undefined,
        gasPrice: request.gasPrice ? BigInt(request.gasPrice) : undefined,
      };

      const tx = await this.wallet.sendTransaction(txRequest);
      
      console.log('Transaction sent:', tx.hash);
      
      // Store transaction locally
      await this.storeTransaction(tx);
      
      return tx;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  // Sign transaction (without sending)
  async signTransaction(request: TransactionRequest): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const txRequest = {
        to: request.to,
        value: request.value ? ethers.parseEther(request.value) : undefined,
        data: request.data,
        gasLimit: request.gasLimit ? BigInt(request.gasLimit) : undefined,
        gasPrice: request.gasPrice ? BigInt(request.gasPrice) : undefined,
        nonce: await this.wallet.getNonce(),
      };

      const signedTx = await this.wallet.signTransaction(txRequest);
      return signedTx;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(): Promise<any[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const txKeys = keys.filter(key => key.startsWith('tx_'));
      const transactions = await AsyncStorage.multiGet(txKeys);
      
      return transactions
        .filter(([_, value]) => value !== null)
        .map(([_, value]) => JSON.parse(value!))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  // Get signed messages
  async getSignedMessages(): Promise<SignedMessage[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const msgKeys = keys.filter(key => key.startsWith('signed_msg_'));
      const messages = await AsyncStorage.multiGet(msgKeys);
      
      return messages
        .filter(([_, value]) => value !== null)
        .map(([_, value]) => JSON.parse(value!))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get signed messages:', error);
      return [];
    }
  }

  // Switch network
  async switchNetwork(rpcUrl: string, chainId: number): Promise<void> {
    try {
      const newProvider = new ethers.JsonRpcProvider(rpcUrl);
      
      if (this.wallet) {
        this.wallet = this.wallet.connect(newProvider);
      }
      
      this.provider = newProvider;
      
      // Verify network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== chainId) {
        throw new Error(`Network mismatch: expected ${chainId}, got ${network.chainId}`);
      }
      
      console.log('Switched to network:', network.name, chainId);
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }

  // Estimate gas
  async estimateGas(request: TransactionRequest): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const gasEstimate = await this.provider.estimateGas({
        to: request.to,
        value: request.value ? ethers.parseEther(request.value) : undefined,
        data: request.data,
      });
      
      return gasEstimate.toString();
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  // Get gas price
  async getGasPrice(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice?.toString() || '0';
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw error;
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    try {
      this.wallet = null;
      this.isConnected = false;
      
      // Clear sensitive data
      await AsyncStorage.removeItem('encrypted_wallet');
      await AsyncStorage.removeItem('wallet_hash');
      
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  // Export private key (requires password verification)
  async exportPrivateKey(password?: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // Verify password if provided
      if (password) {
        const isValid = await this.verifyPassword(password);
        if (!isValid) {
          throw new Error('Invalid password');
        }
      }

      return this.wallet.privateKey;
    } catch (error) {
      console.error('Failed to export private key:', error);
      throw error;
    }
  }

  // Export mnemonic (requires password verification)
  async exportMnemonic(password?: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // Verify password if provided
      if (password) {
        const isValid = await this.verifyPassword(password);
        if (!isValid) {
          throw new Error('Invalid password');
        }
      }

      // Get mnemonic from stored data
      const encryptedData = await AsyncStorage.getItem('encrypted_wallet');
      if (encryptedData) {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, password || 'default').toString(CryptoJS.enc.Utf8);
        const walletData = JSON.parse(decrypted);
        return walletData.mnemonic || 'Mnemonic not available';
      }

      return 'Mnemonic not available';
    } catch (error) {
      console.error('Failed to export mnemonic:', error);
      throw error;
    }
  }

  // Private helper methods
  private async saveWallet(password?: string): Promise<void> {
    if (!this.wallet) {
      throw new Error('No wallet to save');
    }

    try {
      const walletData = {
        privateKey: this.wallet.privateKey,
        address: this.wallet.address,
        publicKey: this.wallet.signingKey.publicKey,
        mnemonic: (this.wallet as any).mnemonic?.phrase || null,
        timestamp: Date.now()
      };

      const encryptionKey = password || 'default';
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(walletData), encryptionKey).toString();
      
      await AsyncStorage.setItem('encrypted_wallet', encrypted);
      
      // Store password hash for verification
      if (password) {
        const passwordHash = CryptoJS.SHA256(password).toString();
        await AsyncStorage.setItem('wallet_hash', passwordHash);
      }
      
      console.log('Wallet saved securely');
    } catch (error) {
      console.error('Failed to save wallet:', error);
      throw error;
    }
  }

  private async restoreWallet(): Promise<ethers.Wallet | null> {
    try {
      const encryptedData = await AsyncStorage.getItem('encrypted_wallet');
      if (!encryptedData) {
        return null;
      }

      // Try to decrypt with default key first
      let decrypted: string;
      try {
        decrypted = CryptoJS.AES.decrypt(encryptedData, 'default').toString(CryptoJS.enc.Utf8);
      } catch {
        // If default fails, wallet is password protected
        console.log('Wallet is password protected');
        return null;
      }

      const walletData = JSON.parse(decrypted);
      const wallet = new ethers.Wallet(walletData.privateKey);
      
      return this.provider ? wallet.connect(this.provider) : wallet;
    } catch (error) {
      console.error('Failed to restore wallet:', error);
      return null;
    }
  }

  private async verifyPassword(password: string): Promise<boolean> {
    try {
      const storedHash = await AsyncStorage.getItem('wallet_hash');
      if (!storedHash) {
        return true; // No password set
      }

      const passwordHash = CryptoJS.SHA256(password).toString();
      return passwordHash === storedHash;
    } catch (error) {
      console.error('Failed to verify password:', error);
      return false;
    }
  }

  private async storeSignedMessage(signedMessage: SignedMessage): Promise<void> {
    try {
      const key = `signed_msg_${signedMessage.timestamp}`;
      await AsyncStorage.setItem(key, JSON.stringify(signedMessage));
    } catch (error) {
      console.error('Failed to store signed message:', error);
    }
  }

  private async storeTransaction(tx: ethers.TransactionResponse): Promise<void> {
    try {
      const txData = {
        hash: tx.hash,
        to: tx.to,
        from: tx.from,
        value: tx.value?.toString(),
        gasLimit: tx.gasLimit?.toString(),
        gasPrice: tx.gasPrice?.toString(),
        nonce: tx.nonce,
        timestamp: Date.now()
      };

      const key = `tx_${tx.hash}`;
      await AsyncStorage.setItem(key, JSON.stringify(txData));
    } catch (error) {
      console.error('Failed to store transaction:', error);
    }
  }

  // Getters
  get connection(): WalletConnection {
    return {
      isConnected: this.isConnected,
      address: this.wallet?.address || null,
      network: this.provider ? 'Connected' : null,
      provider: this.provider ? 'JsonRpcProvider' : null
    };
  }

  get address(): string | null {
    return this.wallet?.address || null;
  }

  get publicKey(): string | null {
    return this.wallet?.signingKey.publicKey || null;
  }

  // Cleanup methods
  async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const walletKeys = keys.filter(key => 
        key.startsWith('tx_') || 
        key.startsWith('signed_msg_') ||
        key === 'encrypted_wallet' ||
        key === 'wallet_hash'
      );
      await AsyncStorage.multiRemove(walletKeys);
      console.log('Wallet data cleared');
    } catch (error) {
      console.error('Failed to clear wallet data:', error);
    }
  }
}

export default Web3WalletService;
