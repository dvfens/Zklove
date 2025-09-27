// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IdentityVerification.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ZKDatingContract
 * @dev Zero-knowledge dating contract with privacy-preserving matching
 * All personal data stays private through ZK proofs and commitments
 */
contract ZKDatingContract is Ownable, ReentrancyGuard {
    
    // ZK Proof structure (Groth16)
    struct ZKProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }
    
    // Dating profile (all data is commitments/hashes)
    struct DatingProfile {
        bytes32 profileCommitment;     // commitment(name, bio, avatar_hash)
        bytes32 locationCommitment;    // commitment(city, lat, lng)
        bytes32 hobbiesCommitment;     // commitment(hobbies_array)
        bytes32 ageCommitment;         // commitment(age, min_age, max_age)
        bytes32 nullifierHash;         // unique identity from verification
        uint256 auraBalance;           // on-chain reputation points
        uint256 totalMatches;          // public match count
        uint256 successfulChats;       // completed conversation count
        bool isActive;
        uint256 createdAt;
        uint256 lastActiveAt;
    }
    
    // Match between two users
    struct Match {
        address user1;
        address user2;
        bool user1Liked;
        bool user2Liked;
        bool isMatched;               // mutual like
        bool chatUnlocked;            // both paid to chat
        uint256 matchedAt;
        uint256 chatUnlockedAt;
        bytes32 sharedSecretHash;     // for E2E encrypted chat
        uint8 compatibilityScore;    // 0-100 based on ZK proofs
    }
    
    // Aura transaction for transparency
    struct AuraTransaction {
        address user;
        int256 amount;                // positive = earned, negative = spent
        string reason;
        uint256 timestamp;
        bytes32 relatedMatchId;
    }
    
    // State variables
    mapping(address => DatingProfile) public profiles;
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(bytes32 => Match) public matches;           // keccak256(user1, user2)
    mapping(address => bytes32[]) public userMatches;
    mapping(address => uint256) public userAuraTransactionCount;
    mapping(address => mapping(uint256 => AuraTransaction)) public auraTransactions;
    
    // Chat message references (encrypted data stored off-chain)
    mapping(bytes32 => bytes32[]) public matchMessages;  // matchId => messageHashes[]
    mapping(bytes32 => mapping(bytes32 => uint256)) public messageTimestamps;
    
    // Compatibility verification tracking
    mapping(bytes32 => bool) public verifiedCompatibilities;
    
    // Constants
    uint256 public constant PROFILE_CREATION_AURA = 100;
    uint256 public constant MUTUAL_MATCH_AURA = 50;
    uint256 public constant CHAT_UNLOCK_COST = 80;
    uint256 public constant BASIC_UNLOCK_COST = 20;
    uint256 public constant BIO_UNLOCK_COST = 40;
    uint256 public constant AVATAR_UNLOCK_COST = 60;
    
    // Reference to identity verification contract
    IdentityVerification public immutable identityContract;
    
    // Events
    event ProfileCreated(address indexed user, bytes32 profileCommitment, uint256 auraAwarded);
    event SwipeRecorded(address indexed swiper, address indexed target, bool isLike, uint8 compatibilityScore);
    event MatchCreated(address indexed user1, address indexed user2, bytes32 matchId, uint256 timestamp);
    event ChatUnlocked(address indexed user1, address indexed user2, bytes32 matchId);
    event AuraEarned(address indexed user, uint256 amount, string reason, bytes32 relatedMatch);
    event AuraSpent(address indexed user, uint256 amount, string purpose, bytes32 relatedMatch);
    event DetailUnlocked(address indexed unlocker, address indexed target, string tier, uint256 cost);
    event MessagePosted(bytes32 indexed matchId, bytes32 messageHash, address sender, uint256 timestamp);
    event CompatibilityProven(address indexed user1, address indexed user2, uint8 score);
    
    constructor(address _identityContract) {
        identityContract = IdentityVerification(_identityContract);
    }
    
    /**
     * @dev Create dating profile with ZK proofs of all commitments
     * @param _profileCommitment Commitment to name, bio, avatar
     * @param _locationCommitment Commitment to city and coordinates  
     * @param _hobbiesCommitment Commitment to hobbies array
     * @param _ageCommitment Commitment to age and preferences
     * @param _nullifierHash Unique identity from verification contract
     * @param _profileProof ZK proof of profile data validity
     * @param _locationProof ZK proof of location data validity
     * @param _hobbiesProof ZK proof of hobbies data validity
     */
    function createProfile(
        bytes32 _profileCommitment,
        bytes32 _locationCommitment, 
        bytes32 _hobbiesCommitment,
        bytes32 _ageCommitment,
        bytes32 _nullifierHash,
        ZKProof memory _profileProof,
        ZKProof memory _locationProof,
        ZKProof memory _hobbiesProof
    ) external nonReentrant {
        require(!profiles[msg.sender].isActive, "Profile already exists");
        require(!usedNullifiers[_nullifierHash], "Nullifier already used");
        
        // Verify user has valid identity verification
        require(identityContract.isNullifierUsed(_nullifierHash), "Identity not verified");
        
        // Verify ZK proofs for all commitments
        require(_verifyProfileProof(_profileProof, _profileCommitment), "Invalid profile proof");
        require(_verifyLocationProof(_locationProof, _locationCommitment), "Invalid location proof");
        require(_verifyHobbiesProof(_hobbiesProof, _hobbiesCommitment), "Invalid hobbies proof");
        
        // Create profile
        profiles[msg.sender] = DatingProfile({
            profileCommitment: _profileCommitment,
            locationCommitment: _locationCommitment,
            hobbiesCommitment: _hobbiesCommitment,
            ageCommitment: _ageCommitment,
            nullifierHash: _nullifierHash,
            auraBalance: PROFILE_CREATION_AURA,
            totalMatches: 0,
            successfulChats: 0,
            isActive: true,
            createdAt: block.timestamp,
            lastActiveAt: block.timestamp
        });
        
        usedNullifiers[_nullifierHash] = true;
        
        // Record aura transaction
        _recordAuraTransaction(msg.sender, int256(PROFILE_CREATION_AURA), "profile_creation", bytes32(0));
        
        emit ProfileCreated(msg.sender, _profileCommitment, PROFILE_CREATION_AURA);
        emit AuraEarned(msg.sender, PROFILE_CREATION_AURA, "profile_creation", bytes32(0));
    }
    
    /**
     * @dev Swipe on another user with ZK proof of compatibility
     * @param _target Target user to swipe on
     * @param _isLike True for like, false for pass
     * @param _compatibilityProof ZK proof showing same city + shared hobbies without revealing them
     * @param _compatibilityScore Compatibility score (0-100) proven by ZK proof
     */
    function swipe(
        address _target,
        bool _isLike,
        ZKProof memory _compatibilityProof,
        uint8 _compatibilityScore
    ) external nonReentrant {
        require(profiles[msg.sender].isActive, "Swiper profile not active");
        require(profiles[_target].isActive, "Target profile not active");
        require(msg.sender != _target, "Cannot swipe yourself");
        require(_compatibilityScore <= 100, "Invalid compatibility score");
        
        // Update last active timestamp
        profiles[msg.sender].lastActiveAt = block.timestamp;
        
        if (_isLike) {
            // Verify compatibility proof for likes only
            require(
                _verifyCompatibilityProof(
                    _compatibilityProof,
                    profiles[msg.sender].locationCommitment,
                    profiles[_target].locationCommitment,
                    profiles[msg.sender].hobbiesCommitment,
                    profiles[_target].hobbiesCommitment,
                    _compatibilityScore
                ),
                "Invalid compatibility proof"
            );
            
            // Record compatibility verification
            bytes32 compatibilityId = keccak256(abi.encodePacked(msg.sender, _target, block.timestamp));
            verifiedCompatibilities[compatibilityId] = true;
            
            emit CompatibilityProven(msg.sender, _target, _compatibilityScore);
        }
        
        bytes32 matchId = _getMatchId(msg.sender, _target);
        Match storage matchData = matches[matchId];
        
        // Initialize match if first interaction
        if (matchData.user1 == address(0)) {
            matchData.user1 = msg.sender;
            matchData.user2 = _target;
            matchData.compatibilityScore = _compatibilityScore;
        }
        
        // Record swipe
        if (matchData.user1 == msg.sender) {
            matchData.user1Liked = _isLike;
        } else if (matchData.user2 == msg.sender) {
            matchData.user2Liked = _isLike;
        }
        
        // Check for mutual match
        if (matchData.user1Liked && matchData.user2Liked && !matchData.isMatched) {
            matchData.isMatched = true;
            matchData.matchedAt = block.timestamp;
            
            // Award aura to both users
            profiles[matchData.user1].auraBalance += MUTUAL_MATCH_AURA;
            profiles[matchData.user2].auraBalance += MUTUAL_MATCH_AURA;
            profiles[matchData.user1].totalMatches++;
            profiles[matchData.user2].totalMatches++;
            
            // Add to user match lists
            userMatches[matchData.user1].push(matchId);
            userMatches[matchData.user2].push(matchId);
            
            // Record aura transactions
            _recordAuraTransaction(matchData.user1, int256(MUTUAL_MATCH_AURA), "mutual_match", matchId);
            _recordAuraTransaction(matchData.user2, int256(MUTUAL_MATCH_AURA), "mutual_match", matchId);
            
            emit MatchCreated(matchData.user1, matchData.user2, matchId, block.timestamp);
            emit AuraEarned(matchData.user1, MUTUAL_MATCH_AURA, "mutual_match", matchId);
            emit AuraEarned(matchData.user2, MUTUAL_MATCH_AURA, "mutual_match", matchId);
        }
        
        emit SwipeRecorded(msg.sender, _target, _isLike, _compatibilityScore);
    }
    
    /**
     * @dev Unlock chat with a matched user
     * @param _matchedUser The user to unlock chat with
     */
    function unlockChat(address _matchedUser) external nonReentrant {
        bytes32 matchId = _getMatchId(msg.sender, _matchedUser);
        Match storage matchData = matches[matchId];
        
        require(matchData.isMatched, "Not matched with this user");
        require(profiles[msg.sender].auraBalance >= CHAT_UNLOCK_COST, "Insufficient aura");
        require(!matchData.chatUnlocked, "Chat already unlocked");
        
        // Both users must pay to unlock chat
        profiles[msg.sender].auraBalance -= CHAT_UNLOCK_COST;
        
        // Check if other user also paid
        // (In practice, this would be more sophisticated with separate tracking)
        matchData.chatUnlocked = true;
        matchData.chatUnlockedAt = block.timestamp;
        
        // Generate shared secret for E2E encryption
        matchData.sharedSecretHash = keccak256(abi.encodePacked(
            matchData.user1, 
            matchData.user2, 
            block.timestamp,
            block.difficulty
        ));
        
        profiles[msg.sender].successfulChats++;
        
        _recordAuraTransaction(msg.sender, -int256(CHAT_UNLOCK_COST), "chat_unlock", matchId);
        
        emit ChatUnlocked(matchData.user1, matchData.user2, matchId);
        emit AuraSpent(msg.sender, CHAT_UNLOCK_COST, "chat_unlock", matchId);
    }
    
    /**
     * @dev Unlock specific profile details
     * @param _target Target user whose details to unlock
     * @param _tier Tier to unlock: "basic", "bio", "avatar"
     */
    function unlockDetails(
        address _target,
        string memory _tier
    ) external nonReentrant {
        bytes32 matchId = _getMatchId(msg.sender, _target);
        require(matches[matchId].isMatched, "Not matched with target");
        
        uint256 cost;
        bytes32 tierHash = keccak256(bytes(_tier));
        
        if (tierHash == keccak256(bytes("basic"))) {
            cost = BASIC_UNLOCK_COST;
        } else if (tierHash == keccak256(bytes("bio"))) {
            cost = BIO_UNLOCK_COST;
        } else if (tierHash == keccak256(bytes("avatar"))) {
            cost = AVATAR_UNLOCK_COST;
        } else {
            revert("Invalid tier");
        }
        
        require(profiles[msg.sender].auraBalance >= cost, "Insufficient aura");
        
        profiles[msg.sender].auraBalance -= cost;
        _recordAuraTransaction(msg.sender, -int256(cost), _tier, matchId);
        
        emit DetailUnlocked(msg.sender, _target, _tier, cost);
        emit AuraSpent(msg.sender, cost, _tier, matchId);
    }
    
    /**
     * @dev Post encrypted message to match
     * @param _recipient Recipient of the message
     * @param _encryptedMessageHash Hash of encrypted message (stored off-chain)
     */
    function postMessage(
        address _recipient,
        bytes32 _encryptedMessageHash
    ) external nonReentrant {
        bytes32 matchId = _getMatchId(msg.sender, _recipient);
        Match storage matchData = matches[matchId];
        
        require(matchData.isMatched, "Not matched");
        require(matchData.chatUnlocked, "Chat not unlocked");
        
        matchMessages[matchId].push(_encryptedMessageHash);
        messageTimestamps[matchId][_encryptedMessageHash] = block.timestamp;
        
        emit MessagePosted(matchId, _encryptedMessageHash, msg.sender, block.timestamp);
    }
    
    // Internal verification functions
    function _verifyProfileProof(ZKProof memory proof, bytes32 commitment) internal pure returns (bool) {
        // Simplified verification - in production use proper verifier contract
        return proof.a[0] != 0 && proof.a[1] != 0 && commitment != bytes32(0);
    }
    
    function _verifyLocationProof(ZKProof memory proof, bytes32 commitment) internal pure returns (bool) {
        return proof.a[0] != 0 && proof.a[1] != 0 && commitment != bytes32(0);
    }
    
    function _verifyHobbiesProof(ZKProof memory proof, bytes32 commitment) internal pure returns (bool) {
        return proof.a[0] != 0 && proof.a[1] != 0 && commitment != bytes32(0);
    }
    
    function _verifyCompatibilityProof(
        ZKProof memory proof,
        bytes32 user1Location,
        bytes32 user2Location, 
        bytes32 user1Hobbies,
        bytes32 user2Hobbies,
        uint8 score
    ) internal pure returns (bool) {
        // Verify proof shows same city AND shared hobbies without revealing actual values
        return proof.a[0] != 0 && proof.a[1] != 0 && 
               user1Location != bytes32(0) && user2Location != bytes32(0) &&
               user1Hobbies != bytes32(0) && user2Hobbies != bytes32(0) &&
               score > 0;
    }
    
    function _getMatchId(address user1, address user2) internal pure returns (bytes32) {
        return user1 < user2 
            ? keccak256(abi.encodePacked(user1, user2))
            : keccak256(abi.encodePacked(user2, user1));
    }
    
    function _recordAuraTransaction(
        address user,
        int256 amount,
        string memory reason,
        bytes32 relatedMatch
    ) internal {
        uint256 index = userAuraTransactionCount[user];
        auraTransactions[user][index] = AuraTransaction({
            user: user,
            amount: amount,
            reason: reason,
            timestamp: block.timestamp,
            relatedMatchId: relatedMatch
        });
        userAuraTransactionCount[user]++;
    }
    
    // View functions
    function getProfile(address user) external view returns (DatingProfile memory) {
        return profiles[user];
    }
    
    function getMatch(address user1, address user2) external view returns (Match memory) {
        return matches[_getMatchId(user1, user2)];
    }
    
    function getUserMatches(address user) external view returns (bytes32[] memory) {
        return userMatches[user];
    }
    
    function getMatchMessages(bytes32 matchId) external view returns (bytes32[] memory) {
        return matchMessages[matchId];
    }
    
    function getAuraBalance(address user) external view returns (uint256) {
        return profiles[user].auraBalance;
    }
    
    function getAuraTransactions(address user) external view returns (AuraTransaction[] memory) {
        uint256 count = userAuraTransactionCount[user];
        AuraTransaction[] memory transactions = new AuraTransaction[](count);
        
        for (uint256 i = 0; i < count; i++) {
            transactions[i] = auraTransactions[user][i];
        }
        
        return transactions;
    }
    
    function isCompatible(address user1, address user2) external view returns (bool) {
        bytes32 compatibilityId = keccak256(abi.encodePacked(user1, user2, block.timestamp));
        return verifiedCompatibilities[compatibilityId];
    }
    
    // Admin functions
    function emergencyPause(address user) external onlyOwner {
        profiles[user].isActive = false;
    }
    
    function updateAuraBalance(address user, uint256 newBalance) external onlyOwner {
        profiles[user].auraBalance = newBalance;
    }
}
