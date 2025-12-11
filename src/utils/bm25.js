/**
 * BM25 (Best Matching 25) - A probabilistic ranking function for keyword search
 * Better than TF-IDF for short documents and handles term frequency saturation
 */

export class BM25 {
  constructor(documents, k1 = 1.5, b = 0.75) {
    this.k1 = k1; // Term frequency saturation parameter (1.2-2.0 typical)
    this.b = b;   // Length normalization parameter (0.75 typical)

    this.documents = documents || [];
    this.docCount = this.documents.length;

    // Handle edge case of empty documents
    if (this.docCount === 0) {
      this.corpus = [];
      this.docLengths = [];
      this.avgDocLength = 0;
      this.idf = new Map();
      return;
    }

    // Preprocess documents
    this.corpus = this.documents.map(doc => this.tokenize(doc?.searchText || ''));
    this.docLengths = this.corpus.map(tokens => tokens.length);
    this.avgDocLength = this.docLengths.reduce((a, b) => a + b, 0) / this.docCount || 0;

    // Calculate IDF (Inverse Document Frequency) for each term
    this.idf = this.calculateIDF();
  }

  /**
   * Tokenize text into normalized terms
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Calculate IDF for all terms in corpus
   * IDF(term) = log((N - df(term) + 0.5) / (df(term) + 0.5))
   * where N = total docs, df = document frequency
   */
  calculateIDF() {
    const termDocFreq = new Map(); // How many docs contain each term

    // Count document frequency for each term
    this.corpus.forEach(tokens => {
      const uniqueTerms = new Set(tokens);
      uniqueTerms.forEach(term => {
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      });
    });

    // Calculate IDF for each term
    const idf = new Map();
    termDocFreq.forEach((df, term) => {
      idf.set(
        term,
        Math.log((this.docCount - df + 0.5) / (df + 0.5) + 1.0)
      );
    });

    return idf;
  }

  /**
   * Calculate BM25 score for a query against a document
   */
  score(queryTokens, docIndex) {
    const docTokens = this.corpus[docIndex];
    const docLength = this.docLengths[docIndex];

    // Count term frequencies in document
    const termFreq = new Map();
    docTokens.forEach(term => {
      termFreq.set(term, (termFreq.get(term) || 0) + 1);
    });

    let score = 0;

    // Sum BM25 score for each query term
    queryTokens.forEach(term => {
      const tf = termFreq.get(term) || 0;
      const idf = this.idf.get(term) || 0;

      if (tf > 0) {
        // BM25 formula
        const numerator = tf * (this.k1 + 1);
        const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength));
        score += idf * (numerator / denominator);
      }
    });

    return score;
  }

  /**
   * Search for query and return ranked results
   */
  search(query, topK = 10) {
    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0 || this.docCount === 0) {
      return [];
    }

    // Score all documents
    const scores = this.documents.map((doc, i) => ({
      ...doc,
      bm25Score: this.score(queryTokens, i)
    }));

    // Sort by score descending and take top K
    return scores
      .filter(doc => doc.bm25Score > 0) // Only return docs that matched
      .sort((a, b) => b.bm25Score - a.bm25Score)
      .slice(0, topK);
  }
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines multiple ranked lists into a single ranking
 * More robust than score averaging because it doesn't assume score scales are comparable
 */
export function reciprocalRankFusion(rankedLists, k = 60) {
  const rrfScores = new Map();

  rankedLists.forEach(rankedList => {
    rankedList.forEach((item, rank) => {
      const id = item.id;
      const rrfScore = 1 / (k + rank + 1); // +1 because rank is 0-indexed

      if (rrfScores.has(id)) {
        rrfScores.set(id, rrfScores.get(id) + rrfScore);
      } else {
        rrfScores.set(id, rrfScore);
      }
    });
  });

  // Convert map to array and sort by RRF score
  return Array.from(rrfScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id, rrfScore: score }));
}
