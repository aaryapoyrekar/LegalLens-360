import React, { useState } from 'react';
import { Scale, Loader2, FileText, CheckCircle2, Shield, Search, ArrowRight, X } from 'lucide-react';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/Dashboard';
import { ContractAnalysis, AppState, UploadedFile, AnalysisMode } from './types';
import { analyzeContract } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('IDLE');
  
  // Input States
  const [contractFile, setContractFile] = useState<UploadedFile | null>(null);
  const [comparisonFile, setComparisonFile] = useState<UploadedFile | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('AUDIT');
  const [userQuery, setUserQuery] = useState('');
  
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!contractFile) return;

    setAppState('ANALYZING');
    setError(null);

    try {
      const result = await analyzeContract(contractFile, comparisonFile, analysisMode, userQuery);
      setAnalysis(result);
      setAppState('RESULTS');
    } catch (err) {
      console.error(err);
      setError("Please upload a valid contract file (PDF or image).");
      setAppState('ERROR');
    }
  };

  const resetApp = () => {
    setAppState('IDLE');
    setContractFile(null);
    setComparisonFile(null);
    setAnalysis(null);
    setUserQuery('');
    setAnalysisMode('AUDIT');
    setError(null);
  };

  const removeFile = (type: 'contract' | 'comparison') => {
    if (type === 'contract') setContractFile(null);
    else setComparisonFile(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={resetApp}>
              <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:bg-blue-700 transition-colors shadow-sm">
                <Scale size={24} strokeWidth={2.5} />
              </div>
              <span className="font-serif text-xl font-bold text-slate-900 tracking-tight">
                LegalLens<span className="text-blue-600">360</span>
              </span>
            </div>
            
            {/* Static Label (Replaces inactive buttons) */}
            <div className="hidden md:flex items-center">
               <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider border border-slate-200 rounded-full px-4 py-1.5 bg-slate-50">
                 AI Contract Auditor
               </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        
        {appState === 'IDLE' && (
          <div className="max-w-5xl mx-auto mt-6 md:mt-10 animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 shadow-sm">
                <Shield size={12} />
                Gemini 3 Pro Powered
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 leading-tight">
                Contract Intelligence,<br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Simplified & Secured.
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Audit risks, compare versions, or rewrite clauses in seconds.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              
              {/* 1. Mode Selector */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Analysis Mode</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'AUDIT', label: 'Risk Audit', desc: 'Standard analysis' },
                    { id: 'COMPARE', label: 'Compare', desc: 'Version differences' },
                    { id: 'REWRITE', label: 'Rewrite', desc: 'Auto-fix clauses' },
                    { id: 'EXPLAIN', label: 'Explain', desc: 'Simple English' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setAnalysisMode(mode.id as AnalysisMode);
                        // Reset comparison file if checking out of comparison mode
                        if (mode.id !== 'COMPARE') setComparisonFile(null);
                      }}
                      className={`
                        p-3 rounded-xl border text-left transition-all
                        ${analysisMode === mode.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      <span className="block font-bold text-sm">{mode.label}</span>
                      <span className="block text-xs opacity-70">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* 2. Primary Contract Upload */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                      {analysisMode === 'COMPARE' ? 'Primary Contract (A)' : 'Contract File'}
                    </label>
                    {contractFile && (
                      <button onClick={() => removeFile('contract')} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                        <X size={12} /> Remove
                      </button>
                    )}
                  </div>
                  
                  {!contractFile ? (
                    <FileUpload 
                      onFileSelect={setContractFile} 
                      label={analysisMode === 'COMPARE' ? "Upload Version A" : "Upload Contract"}
                      compact={analysisMode === 'COMPARE'}
                    />
                  ) : (
                    <div className="h-40 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                        <FileText size={24} />
                      </div>
                      <span className="font-medium text-slate-800 truncate w-full px-4">{contractFile.name}</span>
                      <span className="text-xs text-slate-500 uppercase mt-1">Ready for Analysis</span>
                    </div>
                  )}
                </div>

                {/* 3. Secondary Upload (Conditional) */}
                {analysisMode === 'COMPARE' && (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Comparison Contract (B)
                      </label>
                      {comparisonFile && (
                        <button onClick={() => removeFile('comparison')} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                          <X size={12} /> Remove
                        </button>
                      )}
                    </div>

                    {!comparisonFile ? (
                      <FileUpload 
                        onFileSelect={setComparisonFile} 
                        label="Upload Version B" 
                        subLabel="File to compare against"
                        compact={true}
                      />
                    ) : (
                      <div className="h-40 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                          <FileText size={24} />
                        </div>
                        <span className="font-medium text-slate-800 truncate w-full px-4">{comparisonFile.name}</span>
                        <span className="text-xs text-slate-500 uppercase mt-1">Ready for Comparison</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Help text for single column layout */}
                {analysisMode !== 'COMPARE' && (
                  <div className="flex flex-col justify-center text-slate-500 text-sm px-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                    <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500"/> 
                      Why LegalLens?
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        Detects hidden automatic renewals
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        Flags unfair indemnification clauses
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        Extracts payment deadlines automatically
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        100% Private & Encrypted processing
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 4. Text Input & Action */}
              <div className="border-t border-slate-100 pt-8">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                  Specific Questions (Optional)
                </label>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <textarea
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="E.g., What are the termination conditions? Is there a non-compete clause?"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none resize-none h-24"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!contractFile || (analysisMode === 'COMPARE' && !comparisonFile)}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]
                    ${(!contractFile || (analysisMode === 'COMPARE' && !comparisonFile))
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl'
                    }
                  `}
                >
                  {analysisMode === 'COMPARE' ? 'Compare Versions' : 'Run Analysis'}
                  <ArrowRight size={20} />
                </button>
              </div>

            </div>
          </div>
        )}

        {appState === 'ANALYZING' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white p-6 rounded-full shadow-lg">
                 <Loader2 className="text-blue-600 animate-spin" size={48} />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-serif font-bold text-slate-800">
              {analysisMode === 'COMPARE' ? 'Comparing Versions...' : 'Analyzing Contract...'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Extracting clauses and evaluating risks...</p>
            
            <div className="mt-8 max-w-sm w-full space-y-3 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
               {['Scanning document structure...', 'Extracting legal entities...', 'Evaluating risk factors...', 'Generating plain English summary...'].map((step, i) => (
                 <div key={i} className="flex items-center gap-3 text-sm text-slate-500">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i * 300}ms`}}></div>
                   {step}
                 </div>
               ))}
            </div>
          </div>
        )}

        {appState === 'RESULTS' && analysis && contractFile && (
          <AnalysisDashboard 
            analysis={analysis} 
            file={contractFile} 
            onReset={resetApp} 
          />
        )}

        {appState === 'ERROR' && (
          <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 animate-fade-in">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Analysis Failed</h3>
            <p className="text-slate-600 mb-6">{error || "Please upload a valid contract file (PDF or image)."}</p>
            <button 
              onClick={resetApp}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Try Again
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
