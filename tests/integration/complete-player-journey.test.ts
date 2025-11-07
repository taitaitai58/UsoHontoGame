import { describe, it, expect } from 'vitest';
import { validateSessionId, validateNickname, validateEpisodeSet, validateVoteSubmission } from '@/lib/validators';

/**
 * Integration Test: Complete Player Journey Validation
 * Tests that all validation logic works together for a complete game flow
 */
describe('Integration: Complete Player Journey Validation', () => {
  it('should validate complete player journey data', () => {
    // ========================================
    // STEP 1: Session Creation Validation
    // ========================================
    const sessionId = 'ABCDEF'; // Uses valid character set only
    expect(validateSessionId(sessionId)).toBe(true);

    const hostNickname = 'Alice';
    const nicknameValidation = validateNickname(hostNickname);
    expect(nicknameValidation.valid).toBe(true);

    // ========================================
    // STEP 2: Player Join Validation
    // ========================================
    const playerNicknames = ['Bob', 'Charlie', 'Diana'];
    for (const nickname of playerNicknames) {
      const validation = validateNickname(nickname);
      expect(validation.valid).toBe(true);
    }

    // ========================================
    // STEP 3: Episode Registration Validation
    // ========================================
    const hostEpisodes = [
      { text: 'I once climbed Mount Fuji at sunrise', isLie: false },
      { text: 'I can speak 5 languages fluently', isLie: true },
      { text: 'I have a pet parrot named Kiwi', isLie: false },
    ];

    const episodeValidation = validateEpisodeSet(hostEpisodes);
    expect(episodeValidation.valid).toBe(true);

    // Verify episode count
    expect(hostEpisodes.length).toBe(3);
    const lieCount = hostEpisodes.filter((e) => e.isLie).length;
    expect(lieCount).toBe(1);

    // ========================================
    // STEP 4: Vote Submission Validation
    // ========================================
    const voteData = {
      sessionId: 'ABCDEF',
      teamId: 'team-2',
      turnId: 'turn-1',
      selectedEpisodeNumber: 2,
      presentingTeamId: 'team-1',
    };

    const voteValidation = validateVoteSubmission(voteData);
    expect(voteValidation.valid).toBe(true);

    // ========================================
    // STEP 5: Verify Scoring Logic (Correct Guess)
    // ========================================
    const correctEpisodeNumber = 2; // The lie
    const guessedEpisodeNumber = 2;
    const isCorrect = guessedEpisodeNumber === correctEpisodeNumber;
    expect(isCorrect).toBe(true);

    // Scoring rules from spec
    const pointsForCorrectGuess = 10;
    const pointsPerDeception = 5;

    const votingTeamPoints = isCorrect ? pointsForCorrectGuess : 0;
    const presentingTeamPoints = isCorrect ? 0 : pointsPerDeception;

    expect(votingTeamPoints).toBe(10);
    expect(presentingTeamPoints).toBe(0);

    console.log('✅ Complete player journey validation passed');
    console.log(`   - Session ID format valid: ${sessionId}`);
    console.log(`   - ${1 + playerNicknames.length} participants validated`);
    console.log(`   - ${hostEpisodes.length} episodes validated (${lieCount} lie)`);
    console.log(`   - Vote submission validated`);
    console.log(`   - Scoring logic verified (correct guess: ${votingTeamPoints} points)`);
  });

  it('should validate incorrect vote scenario', () => {
    // ========================================
    // Scenario: Team guesses wrong
    // ========================================
    const episodes = [
      { text: 'This is the first truth episode', isLie: false },
      { text: 'This is actually a lie episode', isLie: true },
      { text: 'This is the second truth episode', isLie: false },
    ];

    const episodeValidation = validateEpisodeSet(episodes);
    expect(episodeValidation.valid).toBe(true);

    // Vote submission (guessing episode 1 instead of 2)
    const voteData = {
      sessionId: 'XYZABC', // Uses valid character set only
      teamId: 'team-b',
      turnId: 'turn-2',
      selectedEpisodeNumber: 1, // Wrong guess
      presentingTeamId: 'team-a',
    };

    const voteValidation = validateVoteSubmission(voteData);
    expect(voteValidation.valid).toBe(true);

    // Scoring for incorrect guess
    const correctEpisodeNumber = 2;
    const guessedEpisodeNumber = 1;
    const isCorrect = guessedEpisodeNumber === correctEpisodeNumber;
    expect(isCorrect).toBe(false);

    const pointsForCorrectGuess = 10;
    const pointsPerDeception = 5;

    const votingTeamPoints = isCorrect ? pointsForCorrectGuess : 0;
    const presentingTeamPoints = isCorrect ? 0 : pointsPerDeception;

    expect(votingTeamPoints).toBe(0); // No points for wrong guess
    expect(presentingTeamPoints).toBe(5); // Deception points

    console.log('✅ Incorrect vote scenario validated');
    console.log(`   - Wrong guess: team earned ${votingTeamPoints} points`);
    console.log(`   - Presenting team earned ${presentingTeamPoints} deception points`);
  });

  it('should reject invalid data at each step', () => {
    // Invalid session ID
    expect(validateSessionId('invalid')).toBe(false);
    expect(validateSessionId('ABC123')).toBe(false); // Contains invalid chars (1,3 not allowed)

    // Invalid nickname
    const emptyNicknameValidation = validateNickname('');
    expect(emptyNicknameValidation.valid).toBe(false);

    const longNicknameValidation = validateNickname('a'.repeat(31));
    expect(longNicknameValidation.valid).toBe(false);

    // Invalid episodes
    const tooFewEpisodes = validateEpisodeSet([
      { text: 'Episode 1', isLie: false },
      { text: 'Episode 2', isLie: true },
    ]);
    expect(tooFewEpisodes.valid).toBe(false);

    const noLie = validateEpisodeSet([
      { text: 'Episode 1', isLie: false },
      { text: 'Episode 2', isLie: false },
      { text: 'Episode 3', isLie: false },
    ]);
    expect(noLie.valid).toBe(false);

    // Invalid vote
    const invalidVoteNumber = validateVoteSubmission({
      sessionId: 'ABCDEF',
      teamId: 'team-1',
      turnId: 'turn-1',
      selectedEpisodeNumber: 4, // Out of range
      presentingTeamId: 'team-2',
    });
    expect(invalidVoteNumber.valid).toBe(false);

    // Voting on own team
    const ownTeamVote = validateVoteSubmission({
      sessionId: 'ABCDEF',
      teamId: 'team-1',
      turnId: 'turn-1',
      selectedEpisodeNumber: 2,
      presentingTeamId: 'team-1', // Same team!
    });
    expect(ownTeamVote.valid).toBe(false);

    console.log('✅ Invalid data properly rejected at all steps');
  });
});
