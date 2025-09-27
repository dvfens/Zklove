pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

/*
 * Profile Commitment Circuit
 * Creates commitment to user profile data without revealing it
 * 
 * Private inputs:
 * - name_hash: Hash of user's name
 * - bio_hash: Hash of user's bio
 * - avatar_hash: Hash of user's avatar
 * - age: User's age
 * - salt: Random salt for commitment
 * 
 * Public inputs:
 * - min_age: Minimum age requirement (e.g., 18)
 * - max_age: Maximum age for platform (e.g., 100)
 * 
 * Public outputs:
 * - commitment: Commitment to profile data
 * - age_valid: 1 if age is within valid range, 0 otherwise
 */

template ProfileCommitment() {
    // Private inputs
    signal private input name_hash;
    signal private input bio_hash;
    signal private input avatar_hash;
    signal private input age;
    signal private input salt;
    
    // Public inputs
    signal input min_age;
    signal input max_age;
    
    // Public outputs
    signal output commitment;
    signal output age_valid;
    
    // Components
    component hasher = Poseidon(5);
    component age_check_min = GreaterEqThan(8);
    component age_check_max = LessEqThan(8);
    
    // Create commitment
    hasher.inputs[0] <== name_hash;
    hasher.inputs[1] <== bio_hash;
    hasher.inputs[2] <== avatar_hash;
    hasher.inputs[3] <== age;
    hasher.inputs[4] <== salt;
    commitment <== hasher.out;
    
    // Validate age range
    age_check_min.in[0] <== age;
    age_check_min.in[1] <== min_age;
    
    age_check_max.in[0] <== age;
    age_check_max.in[1] <== max_age;
    
    age_valid <== age_check_min.out * age_check_max.out;
}

component main = ProfileCommitment();
