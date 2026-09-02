export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  score: number;
}

export interface RetrievalResult {
  query: string;
  knowledgeBase: string;
  documents: KnowledgeDocument[];
  maxScore: number;
  hasEvidence: boolean;
  context: string;
}

const MOCK_KNOWLEDGE_BASES: Record<string, Array<{ id: string; title: string; content: string; keywords: string[] }>> = {
  'company-docs': [
    {
      id: 'doc-1',
      title: 'Work From Home Equipment Reimbursement Policy',
      content: 'Employees are entitled to a one-time $500 stipend for home office monitors, ergonomic keyboards, and mice. Ergonomic chairs are eligible up to $300 with manager sign-off. Standing desks are not reimbursed under standard policy.',
      keywords: ['chair', 'desk', 'ergonomic', 'reimbursement', 'home', 'office', 'equipment', 'stipend']
    },
    {
      id: 'doc-2',
      title: 'Travel and Expense Standard Operating Procedure',
      content: 'Meals during client travel are reimbursed up to $75/day. Hotel accommodations must be booked via internal corporate portal.',
      keywords: ['travel', 'expense', 'meal', 'hotel', 'flight']
    },
    {
      id: 'doc-3',
      title: 'Paid Time Off and Leave Policy 2026',
      content: 'Full-time staff receive 20 days PTO plus 10 federal holidays. Unused PTO rolls over up to a maximum of 5 days.',
      keywords: ['pto', 'vacation', 'leave', 'holiday', 'time off']
    }
  ],
  'product-manuals': [
    {
      id: 'doc-4',
      title: 'CloudScale v4 Compute Cluster Architecture',
      content: 'Compute Node v4 provides 64 vCPUs, 256GB RAM, and 100Gbps network fabric with automated failover.',
      keywords: ['compute', 'node', 'cluster', 'hardware', 'specs']
    }
  ],
  'faq': [
    {
      id: 'doc-5',
      title: 'Password Reset & MFA Setup',
      content: 'To reset your enterprise MFA token, navigate to identity.internal/mfa and request an OTP challenge from your IT admin.',
      keywords: ['mfa', 'password', 'login', 'auth', 'token']
    }
  ]
};

export class RetrievalSimulator {
  static async search(
    query: string,
    knowledgeBase: string = 'company-docs',
    topK: number = 3,
    minScoreThreshold: number = 0.5,
    forceEmpty: boolean = false
  ): Promise<RetrievalResult> {
    // Small simulated retrieval latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (forceEmpty) {
      return {
        query,
        knowledgeBase,
        documents: [],
        maxScore: 0.12,
        hasEvidence: false,
        context: ''
      };
    }

    const kb = MOCK_KNOWLEDGE_BASES[knowledgeBase] || MOCK_KNOWLEDGE_BASES['company-docs'];
    const queryLower = (query || '').toLowerCase();
    const queryTokens = queryLower.split(/\W+/).filter(Boolean);

    const scoredDocs: KnowledgeDocument[] = kb.map((doc) => {
      let matchCount = 0;
      for (const token of queryTokens) {
        if (doc.keywords.some((k) => k.includes(token) || token.includes(k))) {
          matchCount += 1.5;
        }
        if (doc.content.toLowerCase().includes(token)) {
          matchCount += 1;
        }
      }
      const score = Math.min(0.96, Math.max(0.15, matchCount / Math.max(queryTokens.length * 1.5, 1)));
      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        category: knowledgeBase,
        score: parseFloat(score.toFixed(2))
      };
    });

    scoredDocs.sort((a, b) => b.score - a.score);
    const topDocs = scoredDocs.slice(0, topK);
    const maxScore = topDocs[0]?.score || 0;
    const hasEvidence = maxScore >= minScoreThreshold;

    const context = topDocs.map((d) => `[Document: ${d.title} (Relevance: ${d.score})]\n${d.content}`).join('\n\n');

    return {
      query,
      knowledgeBase,
      documents: topDocs,
      maxScore,
      hasEvidence,
      context
    };
  }
}
