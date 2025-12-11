import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ContractAnalysis, UploadedFile, AnalysisMode } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Schema for the analysis output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A concise executive summary of the contract." },
    documentType: { type: Type.STRING, description: "Type of document (e.g., NDA, SLA, Employment Agreement, SaaS Contract)." },
    documentTypeExplanation: { type: Type.STRING, description: "A one-sentence explanation of what this contract type typically entails." },
    riskScore: { type: Type.INTEGER, description: "A calculated risk score from 0 (Safe) to 100 (Extremely Risky)." },
    partiesInvolved: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of parties mentioned in the contract."
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clauseReference: { type: Type.STRING, description: "The specific section or clause number (e.g., 'Clause 4.2')." },
          riskLevel: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
          description: { type: Type.STRING, description: "Explanation of why this is risky." },
          recommendation: { type: Type.STRING, description: "How to mitigate this risk." }
        },
        required: ["clauseReference", "riskLevel", "description", "recommendation"]
      }
    },
    obligations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          dueDate: { type: Type.STRING, description: "Date or timeframe if applicable." },
          responsibleParty: { type: Type.STRING },
          penalty: { type: Type.STRING, description: "Consequence of failure." }
        },
        required: ["description", "responsibleParty"]
      }
    },
    financialTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., Payment, Retainer, Penalty, Renewal Cost" },
          amount: { type: Type.STRING },
          details: { type: Type.STRING }
        },
        required: ["category", "details"]
      }
    },
    missingClauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Standard clauses that are suspiciously missing."
    },
    complianceChecks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., Data Privacy (GDPR/CCPA), IP Rights, Termination, Liability, Consumer Protection." },
          status: { type: Type.STRING, enum: ["PASS", "WARNING", "FAIL"] },
          details: { type: Type.STRING, description: "Reason for the status." }
        },
        required: ["category", "status", "details"]
      },
      description: "Checklist of critical legal/compliance categories."
    },
    versionComparison: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          changeType: { type: Type.STRING, enum: ["ADDED", "REMOVED", "MODIFIED"] },
          clauseReference: { type: Type.STRING },
          description: { type: Type.STRING, description: "What specifically changed." },
          impact: { type: Type.STRING, description: "Legal or financial impact of this change." },
          negotiationTip: { type: Type.STRING, description: "Suggestion on how to handle this change." }
        },
        required: ["changeType", "description", "impact", "negotiationTip"]
      },
      description: "List of significant changes between versions (Only for Compare Mode)."
    },
    comparisonAnalysis: {
      type: Type.STRING,
      description: "Narrative summary of the analysis or answer to specific user query."
    },
    generalRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Strategic negotiation points and general improvements."
    },
    autoFixes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clauseReference: { type: Type.STRING },
          originalText: { type: Type.STRING, description: "Brief snippet of the original problematic text." },
          fixedText: { type: Type.STRING, description: "Rewritten version that is balanced and fair." },
          explanation: { type: Type.STRING, description: "Why this change is better." }
        },
        required: ["clauseReference", "fixedText", "explanation"]
      },
      description: "Suggested rewrites for the 3-5 most critical or unfair clauses."
    }
  },
  required: [
    "summary", "documentType", "documentTypeExplanation", "riskScore", "risks", "obligations", 
    "financialTerms", "missingClauses", "complianceChecks", "generalRecommendations", "autoFixes"
  ]
};

export const analyzeContract = async (
  file: UploadedFile, 
  comparisonFile?: UploadedFile | null,
  mode: AnalysisMode = 'AUDIT',
  userQuery: string = ''
): Promise<ContractAnalysis> => {
  try {
    let systemInstruction = `
      You are LegalLens 360, an expert AI contract auditor. 
      Analyze the provided contract document(s) rigorously.
      The input provided contains one or more image/PDF files which you must read and understand completely.
    `;

    // Tailor prompt based on mode
    let specificTask = '';
    
    if (mode === 'COMPARE') {
      specificTask = `
        **MODE: COMPARE VERSIONS**
        
        INPUTS:
        1. Primary File (First attachment): The original or reference contract.
        2. Comparison File (Second attachment): The new or redlined version.

        TASKS:
        1. Extract text from BOTH files.
        2. Generate a structured 'versionComparison' list:
           - Identify clauses that were ADDED in the second file.
           - Identify clauses that were REMOVED from the first file.
           - Identify clauses that were MODIFIED (semantic changes, not just formatting).
        3. For each change, explain the 'impact' and provide a 'negotiationTip'.
        4. In 'comparisonAnalysis', write a high-level summary of whether the new version is more or less favorable.
        5. Populate standard fields (Risks, Obligations, Financials) based on the **Comparison File** (the latest version).
      `;
    } else if (mode === 'REWRITE') {
      specificTask = `
        **MODE: REWRITE / AUTO-FIX**
        
        TASKS:
        1. Analyze the contract to find the most biased, unclear, or risky clauses.
        2. Focus heavily on filling the 'autoFixes' array.
        3. For each 'autoFix', provide a 'fixedText' that is balanced, fair, and legally sound (standard industry terms).
        4. Explain strictly *why* the original was bad and *why* the fix is better.
      `;
    } else if (mode === 'EXPLAIN') {
      specificTask = `
        **MODE: EXPLAIN IN SIMPLE ENGLISH**
        
        TASKS:
        1. Simplify the entire contract logic.
        2. In 'summary', write a "Plain English" guide to this contract.
        3. In 'risks' and 'obligations', use very simple, non-legalistic language.
        4. If the user asked about specific clauses in 'userQuery', prioritize explaining those in 'comparisonAnalysis'.
      `;
    } else {
      specificTask = `
        **MODE: RISK AUDIT (STANDARD)**
        
        TASKS:
        1. Extract clause list with clause numbers.
        2. Identify High/Medium/Low risks and map them to the 'risks' array.
        3. Calculate a Risk Score (0-100) based on the severity of clauses.
        4. Extract Financial Obligations (payments, penalties) -> 'financialTerms'.
        5. Extract Dates & Deadlines -> 'obligations'.
        6. Build an Obligation Timeline.
        7. Run Compliance Scanning -> 'complianceChecks' (Check GDPR, IP, Termination, etc.).
        8. Detect Contract Type -> 'documentType'.
      `;
    }

    const fullPrompt = `
      ${systemInstruction}
      ${specificTask}
      
      USER QUERY / SPECIFIC INSTRUCTIONS: 
      "${userQuery ? userQuery : 'Perform the analysis as defined by the mode.'}"

      OUTPUT REQUIREMENT:
      Return a valid JSON object matching the defined schema. 
      Ensure all lists (risks, obligations, etc.) are populated if data exists.
    `;

    // Prepare contents (Multimodal support)
    const parts: any[] = [
      {
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      }
    ];

    if (comparisonFile && mode === 'COMPARE') {
      parts.push({
        inlineData: {
          mimeType: comparisonFile.mimeType,
          data: comparisonFile.data
        }
      });
    }

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    if (!response.text) {
      throw new Error("No analysis generated");
    }

    return JSON.parse(response.text) as ContractAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const askFollowUpQuestion = async (
  history: {role: string, text: string}[], 
  question: string, 
  contextData: string
): Promise<string> => {
  const systemInstruction = `
    You are LegalLens 360 Assistant. Use the following contract analysis context to answer user questions.
    Context: ${contextData}
    
    If the user asks to "Rewrite" a clause, provide a legally safer, balanced version in Plain English and then formal legal text.
    Keep answers concise and helpful.
  `;

  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  
  contents.push({ role: 'user', parts: [{ text: question }] });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    return response.text || "I couldn't generate a response.";
  } catch (e) {
    console.error(e);
    return "Error communicating with LegalLens Assistant.";
  }
};
