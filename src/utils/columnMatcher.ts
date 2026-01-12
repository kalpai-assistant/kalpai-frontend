/**
 * Advanced Column Matching Utility
 * Uses semantic similarity and confidence scoring for intelligent column detection
 *
 * Techniques used:
 * 1. Exact matching (highest confidence)
 * 2. Fuzzy matching with variations
 * 3. Levenshtein distance (edit distance)
 * 4. Word overlap scoring
 * 5. Keyword matching with weights
 */

import { SystemField } from "../types/emailList";

interface MatchScore {
  column: string;
  systemField: string;
  score: number;
  confidence: number;
  method: string;
}

/**
 * Calculate Levenshtein distance between two strings
 * Lower distance = more similar
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio (0-1) using Levenshtein distance
 * 1 = identical, 0 = completely different
 */
function similarityRatio(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Calculate word overlap score between two strings
 * Returns ratio of common words
 */
function wordOverlapScore(str1: string, str2: string): number {
  const words1 = str1
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter((w) => w.length > 0);
  const words2 = str2
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter((w) => w.length > 0);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = Array.from(set1).filter((word) => set2.has(word));
  const union = new Set(Array.from(set1).concat(Array.from(set2)));

  return intersection.length / union.size;
}

/**
 * Calculate keyword matching score with weighted importance
 */
function keywordMatchScore(
  column: string,
  keywords: string[],
  weights: number[] = [],
): number {
  const normalizedColumn = column.toLowerCase().replace(/[_-]/g, " ").trim();
  let totalScore = 0;

  keywords.forEach((keyword, index) => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const weight = weights[index] || 1;

    // Exact word match or contains keyword
    if (normalizedColumn.includes(normalizedKeyword)) {
      totalScore += weight;
    } else if (
      normalizedKeyword.includes(normalizedColumn) &&
      normalizedColumn.length > 2
    ) {
      // Column is a substring of keyword (e.g., "mobile" matches "mobile number")
      totalScore += weight * 0.9;
    } else {
      // Check word-by-word matching for multi-word columns
      const columnWords = normalizedColumn.split(/\s+/);
      const keywordWords = normalizedKeyword.split(/\s+/);

      let wordMatches = 0;
      columnWords.forEach((colWord) => {
        keywordWords.forEach((keyWord) => {
          if (
            colWord === keyWord ||
            colWord.includes(keyWord) ||
            keyWord.includes(colWord)
          ) {
            wordMatches++;
          }
        });
      });

      if (wordMatches > 0) {
        const wordMatchRatio =
          wordMatches / Math.max(columnWords.length, keywordWords.length);
        totalScore += weight * wordMatchRatio * 0.85;
      } else {
        // Partial match with similarity as fallback
        const similarity = similarityRatio(normalizedColumn, normalizedKeyword);
        if (similarity > 0.7) {
          totalScore += weight * similarity * 0.75;
        }
      }
    }
  });

  return keywords.length > 0 ? totalScore / keywords.length : 0;
}

/**
 * Field-specific keyword definitions with variations and weights
 */
const FIELD_KEYWORDS: {
  [key: string]: { keywords: string[]; weights?: number[] };
} = {
  email: {
    keywords: [
      "email",
      "e-mail",
      "mail",
      "email address",
      "emailaddress",
      "e-mailadres",
      "correo",
      "lead email",
      "contact email",
      "em",
      "eml",
    ],
    weights: [1.0, 1.0, 0.8, 1.0, 1.0, 0.9, 0.7, 1.0, 1.0, 0.75, 0.75],
  },
  name: {
    keywords: [
      "name",
      "full name",
      "fullname",
      "contact name",
      "contact",
      "person",
      "nombre",
      "lead name",
      "contact full name",
      "naem",
      "nm",
    ],
    weights: [1.0, 1.0, 1.0, 1.0, 0.7, 0.6, 0.7, 1.0, 1.0, 0.8, 0.7],
  },
  first_name: {
    keywords: [
      "first name",
      "firstname",
      "first",
      "given name",
      "givenname",
      "fname",
      "forename",
      "fn",
      "fst name",
    ],
    weights: [1.0, 1.0, 0.8, 1.0, 1.0, 0.95, 0.9, 0.85, 0.85],
  },
  last_name: {
    keywords: [
      "last name",
      "lastname",
      "last",
      "surname",
      "family name",
      "familyname",
      "lname",
      "ln",
      "lst name",
    ],
    weights: [1.0, 1.0, 0.8, 1.0, 1.0, 1.0, 0.95, 0.85, 0.85],
  },
  company_name: {
    keywords: [
      "company",
      "company name",
      "companyname",
      "organization",
      "org",
      "business",
      "employer",
      "organization name",
      "co",
      "compnay",
      "cmpany",
    ],
    weights: [1.0, 1.0, 1.0, 1.0, 0.9, 0.8, 0.7, 1.0, 0.75, 0.8, 0.8],
  },
  location: {
    keywords: [
      "location",
      "city",
      "place",
      "address",
      "region",
      "town",
      "locality",
      "lead location",
      "office location",
      "loc",
      "loaction",
    ],
    weights: [1.0, 1.0, 0.8, 0.9, 0.9, 0.9, 0.8, 1.0, 1.0, 0.75, 0.8],
  },
  phone_number: {
    keywords: [
      "phone",
      "phone number",
      "phonenumber",
      "mobile",
      "contact number",
      "tel",
      "telephone",
      "cell",
      "lead phone",
      "mobile number",
      "telephone number",
      "ph",
      "phoen",
      "ph no",
    ],
    weights: [
      1.0, 1.0, 1.0, 1.0, 1.0, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 0.8, 0.8, 0.95,
    ],
  },
};

/**
 * Calculate comprehensive match score for a column-field pair
 */
function calculateMatchScore(
  column: string,
  systemField: SystemField,
): MatchScore {
  const normalizedColumn = column.toLowerCase().replace(/[_-]/g, " ").trim();
  const fieldKey = systemField.key;
  const fieldLabel = systemField.label.toLowerCase();

  // 1. Exact match (highest priority)
  if (normalizedColumn === fieldKey.replace(/_/g, " ")) {
    return {
      column,
      systemField: fieldKey,
      score: 100,
      confidence: 1.0,
      method: "exact_match",
    };
  }

  // 2. Label match
  if (normalizedColumn === fieldLabel) {
    return {
      column,
      systemField: fieldKey,
      score: 95,
      confidence: 0.95,
      method: "label_match",
    };
  }

  // 3. Keyword matching with field-specific variations
  const fieldKeywords = FIELD_KEYWORDS[fieldKey];
  let keywordScore = 0;
  if (fieldKeywords) {
    keywordScore = keywordMatchScore(
      column,
      fieldKeywords.keywords,
      fieldKeywords.weights,
    );
  }

  // 4. String similarity with field key and label
  const keySimilarity = similarityRatio(
    normalizedColumn,
    fieldKey.replace(/_/g, " "),
  );
  const labelSimilarity = similarityRatio(normalizedColumn, fieldLabel);
  const maxSimilarity = Math.max(keySimilarity, labelSimilarity);

  // 5. Word overlap
  const keyOverlap = wordOverlapScore(
    normalizedColumn,
    fieldKey.replace(/_/g, " "),
  );
  const labelOverlap = wordOverlapScore(normalizedColumn, fieldLabel);
  const maxOverlap = Math.max(keyOverlap, labelOverlap);

  // Weighted scoring (keyword matching has highest weight)
  const compositeScore =
    keywordScore * 0.6 + // 60% weight to keyword matching (increased)
    maxSimilarity * 0.25 + // 25% weight to string similarity
    maxOverlap * 0.15; // 15% weight to word overlap

  // Convert to 0-100 scale
  const finalScore = compositeScore * 100;

  // Determine method and confidence
  let method = "semantic_match";
  let confidence = compositeScore;

  if (keywordScore > 0.7) {
    method = "keyword_match";
    confidence = keywordScore;
  } else if (maxSimilarity > 0.8) {
    method = "fuzzy_match";
    confidence = maxSimilarity;
  } else if (maxOverlap > 0.6) {
    method = "word_overlap";
    confidence = maxOverlap;
  }

  return {
    column,
    systemField: fieldKey,
    score: finalScore,
    confidence,
    method,
  };
}

/**
 * Auto-detect column mappings using semantic similarity
 * Returns mapping with highest confidence matches
 */
export function autoDetectColumnsWithSemantics(
  fileColumns: string[],
  systemFields: SystemField[],
  minConfidence: number = 0.5,
): { [systemField: string]: string | null } {
  const mapping: { [systemField: string]: string | null } = {};
  const usedColumns = new Set<string>();

  // Calculate all possible matches
  const allMatches: MatchScore[] = [];
  systemFields.forEach((field) => {
    fileColumns.forEach((column) => {
      const match = calculateMatchScore(column, field);
      if (match.confidence >= minConfidence) {
        allMatches.push(match);
      }
    });
  });

  // Sort by score (descending) to prioritize best matches
  allMatches.sort((a, b) => b.score - a.score);

  // Assign mappings (one column per system field, best match wins)
  allMatches.forEach((match) => {
    // Skip if this column is already used
    if (usedColumns.has(match.column)) return;

    // Skip if this system field already has a mapping
    if (mapping[match.systemField] !== undefined) return;

    // Assign the mapping
    mapping[match.systemField] = match.column;
    usedColumns.add(match.column);
  });

  // Initialize unmapped fields as null
  systemFields.forEach((field) => {
    if (mapping[field.key] === undefined) {
      mapping[field.key] = null;
    }
  });

  return mapping;
}

/**
 * Get match quality for debugging/visualization
 */
export function getMatchQuality(
  column: string,
  systemField: SystemField,
): {
  score: number;
  confidence: number;
  method: string;
  quality: "excellent" | "good" | "fair" | "poor";
} {
  const match = calculateMatchScore(column, systemField);

  let quality: "excellent" | "good" | "fair" | "poor";
  if (match.confidence >= 0.9) quality = "excellent";
  else if (match.confidence >= 0.7) quality = "good";
  else if (match.confidence >= 0.5) quality = "fair";
  else quality = "poor";

  return {
    score: match.score,
    confidence: match.confidence,
    method: match.method,
    quality,
  };
}

/**
 * Debug function to see all match scores
 */
export function debugMatchScores(
  fileColumns: string[],
  systemFields: SystemField[],
): MatchScore[] {
  const allMatches: MatchScore[] = [];

  systemFields.forEach((field) => {
    fileColumns.forEach((column) => {
      allMatches.push(calculateMatchScore(column, field));
    });
  });

  return allMatches.sort((a, b) => b.score - a.score);
}
