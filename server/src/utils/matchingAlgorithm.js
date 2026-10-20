/**
 * Smart Team Matching Algorithm
 * Calculates an explainable compatibility score between users or between a team and a candidate.
 */

export function calculateUserCompatibility(targetUser, candidateUser) {
  if (!targetUser || !candidateUser) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];

  // 1. Complementary Skills (Weight: 30%)
  const targetSkills = new Set((targetUser.skills || []).map(s => s.toLowerCase().trim()));
  const candidateSkills = new Set((candidateUser.skills || []).map(s => s.toLowerCase().trim()));
  
  // Find intersection and unique strengths
  const sharedSkills = [...candidateSkills].filter(s => targetSkills.has(s));
  const uniqueComplementary = [...candidateSkills].filter(s => !targetSkills.has(s));

  if (sharedSkills.length > 0 && uniqueComplementary.length > 0) {
    score += 28;
    reasons.push(`Complementary tech stack (${sharedSkills.slice(0, 2).join(', ')} in common, plus unique skills: ${uniqueComplementary.slice(0, 2).join(', ')})`);
  } else if (sharedSkills.length > 0) {
    score += 20;
    reasons.push(`Shared tech stack in ${sharedSkills.slice(0, 3).join(', ')}`);
  } else if (uniqueComplementary.length > 0) {
    score += 18;
    reasons.push(`Brings fresh capabilities in ${uniqueComplementary.slice(0, 2).join(', ')}`);
  }

  // 2. Role Synergy (Weight: 20%)
  const targetRoles = new Set((targetUser.preferredRoles || []).map(r => r.toLowerCase().trim()));
  const candidateRoles = new Set((candidateUser.preferredRoles || []).map(r => r.toLowerCase().trim()));
  
  // Opposing/complementary roles (e.g. frontend + backend, or designer + developer)
  const isTargetFrontend = targetRoles.has('frontend') || targetRoles.has('ui/ux designer');
  const isCandidateBackend = candidateRoles.has('backend') || candidateRoles.has('ai/ml engineer') || candidateRoles.has('cloud');
  const isTargetBackend = targetRoles.has('backend') || targetRoles.has('ai/ml engineer') || targetRoles.has('cloud');
  const isCandidateFrontend = candidateRoles.has('frontend') || candidateRoles.has('ui/ux designer');

  if ((isTargetFrontend && isCandidateBackend) || (isTargetBackend && isCandidateFrontend)) {
    score += 20;
    reasons.push('High role synergy (complementary disciplines)');
  } else if ([...candidateRoles].some(r => !targetRoles.has(r))) {
    score += 15;
    reasons.push('Provides diverse functional role coverage');
  } else {
    score += 10;
  }

  // 3. Shared Hackathon Interests & Categories (Weight: 20%)
  const targetCats = new Set((targetUser.preferredHackathonCategories || targetUser.interests || []).map(c => c.toLowerCase().trim()));
  const candidateCats = (candidateUser.preferredHackathonCategories || candidateUser.interests || []).map(c => c.toLowerCase().trim());
  const sharedCats = candidateCats.filter(c => targetCats.has(c));

  if (sharedCats.length > 0) {
    score += 20;
    reasons.push(`Shared hackathon interests in ${sharedCats.slice(0, 2).join(', ')}`);
  } else {
    score += 5;
  }

  // 4. Availability & Commitment Overlap (Weight: 15%)
  if (targetUser.availability && candidateUser.availability) {
    if (targetUser.availability === candidateUser.availability) {
      score += 15;
      reasons.push(`Matched schedule commitment (${candidateUser.availability})`);
    } else {
      score += 8;
    }
  } else {
    score += 10;
  }

  // 5. Collaboration Mode (Weight: 10%)
  if (targetUser.collaborationMode && candidateUser.collaborationMode) {
    if (targetUser.collaborationMode === candidateUser.collaborationMode ||
        targetUser.collaborationMode === 'Hybrid' ||
        candidateUser.collaborationMode === 'Hybrid') {
      score += 10;
      reasons.push(`Aligned ${candidateUser.collaborationMode.toLowerCase()} collaboration mode`);
    } else {
      score += 3;
    }
  } else {
    score += 7;
  }

  // 6. Experience Level Balance (Weight: 5%)
  const levels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
  const targetLvl = levels[targetUser.experienceLevel] || 2;
  const candLvl = levels[candidateUser.experienceLevel] || 2;
  const diff = Math.abs(targetLvl - candLvl);

  if (diff <= 1) {
    score += 5;
    reasons.push('Compatible experience level for peer velocity');
  } else {
    score += 3;
    reasons.push('Great mentor/mentee dynamic');
  }

  const finalScore = Math.min(Math.max(score, 25), 98);
  const headline = reasons.length > 0
    ? `${finalScore}% Match — ${reasons.slice(0, 2).join(' and ')}.`
    : `${finalScore}% Match — Good all-around compatibility.`;

  return {
    score: finalScore,
    headline,
    reasons,
  };
}

/**
 * Calculates how well a candidate fits a team's missing skill gaps and open roles
 */
export function analyzeTeamGaps(team, candidateUser) {
  if (!team || !candidateUser) return { score: 0, gapFit: [], reasons: [] };

  let score = 30; // base score for candidate interest
  const reasons = [];
  const gapFit = [];

  // 1. Check open positions
  const candidateRoles = (candidateUser.preferredRoles || []).map(r => r.toLowerCase().trim());
  const unfilledPositions = (team.openPositions || []).filter(p => !p.filled);

  for (const pos of unfilledPositions) {
    const posRole = pos.role.toLowerCase().trim();
    if (candidateRoles.some(r => r.includes(posRole) || posRole.includes(r))) {
      score += 35;
      gapFit.push(pos.role);
      reasons.push(`Directly matches open role: "${pos.role}"`);
      break;
    }
  }

  // 2. Check team required skills missing from current members
  const teamSkills = new Set((team.requiredSkills || team.techStack || []).map(s => s.toLowerCase().trim()));
  const candidateSkills = new Set((candidateUser.skills || []).map(s => s.toLowerCase().trim()));

  const matchedRequired = [...candidateSkills].filter(s => teamSkills.has(s));
  if (matchedRequired.length > 0) {
    score += 25;
    reasons.push(`Covers required team technologies (${matchedRequired.slice(0, 3).join(', ')})`);
  }

  // 3. Collaboration mode
  if (team.collaborationMode === candidateUser.collaborationMode || team.collaborationMode === 'Hybrid') {
    score += 10;
  }

  const finalScore = Math.min(Math.max(score, 30), 99);
  const headline = reasons.length > 0
    ? `${finalScore}% Fit — ${reasons[0]}`
    : `${finalScore}% Fit — Available for team recruitment`;

  return {
    score: finalScore,
    headline,
    gapFit,
    reasons,
  };
}
