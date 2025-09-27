pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

/*
 * Compatibility Check Circuit
 * Proves two users are compatible (same city + shared hobbies) without revealing actual data
 * 
 * Private inputs:
 * - user1_city: User 1's city
 * - user1_hobbies[5]: User 1's hobbies array (max 5 hobbies)
 * - user2_city: User 2's city  
 * - user2_hobbies[5]: User 2's hobbies array (max 5 hobbies)
 * - salt1, salt2: Random salts for commitments
 * 
 * Public inputs:
 * - user1_location_commitment: Commitment to user 1's location
 * - user2_location_commitment: Commitment to user 2's location
 * - user1_hobbies_commitment: Commitment to user 1's hobbies
 * - user2_hobbies_commitment: Commitment to user 2's hobbies
 * 
 * Public outputs:
 * - is_compatible: 1 if same city and shared hobbies, 0 otherwise
 * - compatibility_score: 0-100 based on hobby overlap
 */

template CompatibilityCheck() {
    // Private inputs
    signal private input user1_city;
    signal private input user1_hobbies[5];
    signal private input user2_city;
    signal private input user2_hobbies[5];
    signal private input salt1;
    signal private input salt2;
    signal private input salt3;
    signal private input salt4;
    
    // Public inputs (commitments)
    signal input user1_location_commitment;
    signal input user2_location_commitment;
    signal input user1_hobbies_commitment;
    signal input user2_hobbies_commitment;
    
    // Public outputs
    signal output is_compatible;
    signal output compatibility_score;
    
    // Components
    component location_hasher1 = Poseidon(2);
    component location_hasher2 = Poseidon(2);
    component hobbies_hasher1 = Poseidon(6); // 5 hobbies + salt
    component hobbies_hasher2 = Poseidon(6);
    
    component city_eq = IsEqual();
    component hobby_comparators[25]; // 5x5 comparisons
    
    // Verify location commitments
    location_hasher1.inputs[0] <== user1_city;
    location_hasher1.inputs[1] <== salt1;
    location_hasher1.out === user1_location_commitment;
    
    location_hasher2.inputs[0] <== user2_city;
    location_hasher2.inputs[1] <== salt2;
    location_hasher2.out === user2_location_commitment;
    
    // Verify hobbies commitments
    hobbies_hasher1.inputs[0] <== user1_hobbies[0];
    hobbies_hasher1.inputs[1] <== user1_hobbies[1];
    hobbies_hasher1.inputs[2] <== user1_hobbies[2];
    hobbies_hasher1.inputs[3] <== user1_hobbies[3];
    hobbies_hasher1.inputs[4] <== user1_hobbies[4];
    hobbies_hasher1.inputs[5] <== salt3;
    hobbies_hasher1.out === user1_hobbies_commitment;
    
    hobbies_hasher2.inputs[0] <== user2_hobbies[0];
    hobbies_hasher2.inputs[1] <== user2_hobbies[1];
    hobbies_hasher2.inputs[2] <== user2_hobbies[2];
    hobbies_hasher2.inputs[3] <== user2_hobbies[3];
    hobbies_hasher2.inputs[4] <== user2_hobbies[4];
    hobbies_hasher2.inputs[5] <== salt4;
    hobbies_hasher2.out === user2_hobbies_commitment;
    
    // Check if cities match
    city_eq.in[0] <== user1_city;
    city_eq.in[1] <== user2_city;
    
    // Count shared hobbies
    var shared_hobbies = 0;
    var hobby_index = 0;
    
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            hobby_comparators[hobby_index] = IsEqual();
            hobby_comparators[hobby_index].in[0] <== user1_hobbies[i];
            hobby_comparators[hobby_index].in[1] <== user2_hobbies[j];
            shared_hobbies += hobby_comparators[hobby_index].out;
            hobby_index++;
        }
    }
    
    // Calculate compatibility
    component has_shared_hobbies = GreaterThan(4);
    has_shared_hobbies.in[0] <== shared_hobbies;
    has_shared_hobbies.in[1] <== 0;
    
    // Compatible if same city AND has shared hobbies
    is_compatible <== city_eq.out * has_shared_hobbies.out;
    
    // Calculate compatibility score (0-100)
    // Score = (shared_hobbies / 5) * 100, capped at 100
    component score_calc = LessThan(8);
    score_calc.in[0] <== shared_hobbies;
    score_calc.in[1] <== 6; // Cap at 5 shared hobbies
    
    compatibility_score <== shared_hobbies * 20; // Each shared hobby = 20 points
}

component main = CompatibilityCheck();
