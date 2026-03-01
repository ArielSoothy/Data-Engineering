// Shared offline feedback generator — used by all providers when no API key is set
// or when an unexpected error falls through.

export const generateMockFeedback = (userAnswer: string, correctAnswer: string): string => {
  const userLength = userAnswer.length;
  const correctLength = correctAnswer.length;
  const similarityScore = Math.min(userLength / correctLength, correctLength / userLength);

  const correctKeywords = correctAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 4);
  const userKeywords = userAnswer.toLowerCase().split(/\s+/);
  const matchedKeywords = correctKeywords.filter(word => userKeywords.includes(word));
  const keywordScore = correctKeywords.length > 0 ? matchedKeywords.length / correctKeywords.length : 0;

  const overallScore = (similarityScore * 0.4) + (keywordScore * 0.6);

  if (overallScore > 0.8) {
    return `**Excellent Answer!**

**Strengths:**
- Complete coverage of key concepts
- Clear technical explanation
- Good interview-ready structure

**For Meta E5/E6 Interview:**
- This level of detail demonstrates Senior-level thinking
- You've covered the technical depth and scale considerations Meta expects

Keep practicing at this level!`;
  } else if (overallScore > 0.5) {
    return `**Good Foundation, Room for Improvement**

**Strengths:**
- You understand the core concept
- Decent technical approach

**Missing for Meta:**
- Add more detail about ${correctKeywords.slice(0, 2).join(', ')}
- Include petabyte-scale and idempotency considerations
- Reference your pipeline experience at Simplex/Nuvei when relevant

**Next Steps:** Review the complete answer and practice explaining it concisely.`;
  } else {
    return `**Needs More Preparation**

**Key Gaps:**
- Missing fundamental concepts Meta expects at E5/E6
- Limited technical depth for senior role
- Need stronger connection to scale and operational concerns

**Study Plan:**
1. Review the core principles in the reference answer
2. Practice explaining with your dbt/Airflow background
3. Focus on system design thinking Meta values — idempotency, fault tolerance, scale

Don't get discouraged - targeted practice will get you there!`;
  }
};
