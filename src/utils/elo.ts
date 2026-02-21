/**
 * Calculates the expected score for player A versus player B.
 * Expected Score = 1 / (1 + 10^((Rating B - Rating A) / 400))
 * 
 * @param ratingA The rating of the primary entity (e.g., User)
 * @param ratingB The rating of the opposing entity (e.g., Problem)
 * @returns The expected probability of player A winning (0.0 to 1.0)
 */
export function getExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates new ELO ratings for both the user and the problem after an attempt.
 * 
 * ActualScore: 
 *  1 = User Accepted (Problem Failed)
 *  0 = User Failed (Problem Accepted)
 * 
 * @param userELO The current ELO rating of the user
 * @param problemELO The current ELO rating of the problem
 * @param actualScore The outcome of the attempt (1 for win, 0 for loss)
 * @param kFactor The maximum possible rating change per event (default: 32)
 * @returns An object containing the new User ELO and the new Problem ELO
 */
export function calculateNewELO(
    userELO: number,
    problemELO: number,
    actualScore: number,
    kFactor: number = 32
): { newUserELO: number; newProblemELO: number } {
    // 1. Calculate expected scores
    const expectedUserScore = getExpectedScore(userELO, problemELO);
    const expectedProblemScore = getExpectedScore(problemELO, userELO);

    // 2. Define actual scores
    // If user wins (1), problem loses (0). If user loses (0), problem wins (1).
    const actualProblemScore = 1 - actualScore;

    // 3. Update ELO ratings
    // NewRating = OldRating + K * (ActualScore - ExpectedScore)
    const newUserRating = userELO + kFactor * (actualScore - expectedUserScore);
    const newProblemRating = problemELO + kFactor * (actualProblemScore - expectedProblemScore);

    // 4. Return rounded values (ratings are integers typically)
    return {
        newUserELO: Math.round(newUserRating),
        newProblemELO: Math.round(newProblemRating),
    };
}
