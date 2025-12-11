export interface Risk {
  clauseReference: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  recommendation: string;
}

export interface Obligation {
  description: string;
  dueDate?: string;
  responsibleParty: string;
  penalty?: string;
}

export interface FinancialTerm {
  category: string;
  amount?: string;
  details: string;
}

export interface AutoFix {
  clauseReference: string;
  originalText?: string;
  fixedText: string;
  explanation: string;
}

export interface ComplianceCheck {
  category: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  details: string;
}

export interface VersionDiff {
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED';
  clauseReference: string;
  description: string;
  impact: string;
  negotiationTip: string;
}

export interface ContractAnalysis {
  summary: string;
  documentType: string;
  documentTypeExplanation: string; // Brief explanation of the detected type
  riskScore: number; // 0-100
  partiesInvolved: string[];
  risks: Risk[];
  obligations: Obligation[];
  financialTerms: FinancialTerm[];
  missingClauses: string[];
  complianceChecks: ComplianceCheck[]; // New compliance section
  versionComparison?: VersionDiff[]; // Structured diff for Compare mode
  comparisonAnalysis?: string; // Narrative analysis of changes or specific query
  generalRecommendations: string[]; // General negotiation tips
  autoFixes: AutoFix[]; // Rewritten clauses
}

export interface UploadedFile {
  data: string; // Base64
  mimeType: string;
  name: string;
}

export type AppState = 'IDLE' | 'ANALYZING' | 'RESULTS' | 'ERROR';

export type AnalysisMode = 'AUDIT' | 'COMPARE' | 'REWRITE' | 'EXPLAIN';
