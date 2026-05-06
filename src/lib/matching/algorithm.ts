// ============================================================
// Mentor.me — Matching Algorithm
// Weights problem context higher than general expertise.
// This is a placeholder — will be refined in Phase 2.
// ============================================================
export function calculateMatchScore(
  student: Profile,
  mentor: Profile
): MatchResult {
  const studentProblemTokens = tokenize(student.problem);
  const studentIdeaTokens = tokenize(student.idea);
  const mentorExpertiseTokens = mentor.expertise.flatMap(tokenize);
  const mentorBioTokens = tokenize(mentor.bio);

  // Weighting: student problem context dominates, then idea, then mentor expertise/bio.
  // The goal is to bias towards “specific problem fit” over generic mentor labels.
  const sProblemToExpertise = jaccard(studentProblemTokens, mentorExpertiseTokens);
  const sProblemToBio = jaccard(studentProblemTokens, mentorBioTokens);
  const sIdeaToExpertise = jaccard(studentIdeaTokens, mentorExpertiseTokens);
  const sIdeaToBio = jaccard(studentIdeaTokens, mentorBioTokens);

  const problemComponent = 0.65 * sProblemToExpertise + 0.35 * sProblemToBio;
  const ideaComponent = 0.7 * sIdeaToExpertise + 0.3 * sIdeaToBio;

  // Problem > idea (and expertise is already baked into both).
  const raw = 0.7 * problemComponent + 0.3 * ideaComponent;
  const score = Math.max(0, Math.min(100, Math.round(raw * 100)));

  const overlapProblem = topOverlaps(
    studentProblemTokens,
    [...mentorExpertiseTokens, ...mentorBioTokens],
    5
  );
  const overlapIdea = topOverlaps(
    studentIdeaTokens,
    [...mentorExpertiseTokens, ...mentorBioTokens],
    4
  );

  const reasons: string[] = [];
  if (overlapProblem.length > 0) {
    reasons.push(`Problem fit: ${overlapProblem.join(", ")}.`);
  } else {
    reasons.push("Problem fit: broader mentor profile match (few shared keywords).");
  }
  if (overlapIdea.length > 0) {
    reasons.push(`Idea alignment: ${overlapIdea.join(", ")}.`);
  }
  if (mentor.expertise.length > 0) {
    reasons.push(`Expertise: ${mentor.expertise.slice(0, 3).join(", ")}.`);
  }

  return {
    mentor_id: mentor.id,
    student_id: student.id,
    score,
    reasoning: reasons.join(" "),
  };
}
