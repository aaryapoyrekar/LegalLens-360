import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CheckCircle, AlertTriangle, 
  DollarSign, Calendar, Scale,
  Wrench, FileText, ArrowRightCircle, ClipboardCheck, XCircle,
  GitCompare, Plus, Minus, Edit3, Target, ShieldCheck, ArrowUp
} from 'lucide-react';
import { ContractAnalysis, UploadedFile } from '../types';
import RiskMeter from './RiskMeter';
import ChatInterface from './ChatInterface';

interface DashboardProps {
  analysis: ContractAnalysis;
  file: UploadedFile;
  onReset: () => void;
}

const AnalysisDashboard: React.FC<DashboardProps> = ({ analysis, file, onReset }) => {
  const [activeTab, setActiveTab] = useState<'risks' | 'compliance' | 'obligations' | 'financial' | 'fixes' | 'diff'>('risks');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Automatically switch to Diff tab if comparison data exists
  useEffect(() => {
    if (analysis.versionComparison && analysis.versionComparison.length > 0) {
      setActiveTab('diff');
    }
  }, [analysis.versionComparison]);

  // Handle Scroll to Top visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const highRisks = analysis.risks.filter(r => r.riskLevel === 'HIGH').length;
  const mediumRisks = analysis.risks.filter(r => r.riskLevel === 'MEDIUM').length;
  const lowRisks = analysis.risks.filter(r => r.riskLevel === 'LOW').length;

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 animate-fade-in font-sans relative">
      
      {/* 1. Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex-1 space-y-4">
            {/* Header: Badge & Title */}
            <div className="flex flex-wrap items-center gap-3">
               <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                 <FileText size={12} className="text-blue-400"/>
                 {analysis.documentType}
               </span>
               <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
                 {file.name}
               </h2>
            </div>

            {/* Summary Text */}
            <p className="text-slate-600 text-lg leading-relaxed max-w-4xl border-l-4 border-blue-500 pl-4 py-1 bg-slate-50/50 rounded-r-lg">
              {analysis.summary}
            </p>

            {/* Quick Stats Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${analysis.riskScore > 70 ? 'bg-red-500' : analysis.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-sm font-bold text-slate-700">Risk Score: <span className="text-slate-900 text-lg">{analysis.riskScore}</span>/100</span>
                </div>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <div className="flex gap-4 text-sm font-medium">
                  <span className="text-slate-600 flex items-center gap-1"><span className="text-red-600 font-extrabold bg-red-50 px-2 py-0.5 rounded">{highRisks}</span> High</span>
                  <span className="text-slate-600 flex items-center gap-1"><span className="text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded">{mediumRisks}</span> Med</span>
                  <span className="text-slate-600 flex items-center gap-1"><span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">{lowRisks}</span> Low</span>
                </div>
              </div>

              {analysis.documentTypeExplanation && (
                 <span className="text-xs text-blue-700 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 font-medium hidden md:inline-flex items-center gap-2">
                    <CheckCircle size={14} /> {analysis.documentTypeExplanation}
                 </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 min-w-[140px] justify-start">
            <button 
              onClick={onReset}
              className="w-full px-4 py-3 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Analysis
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5 mr-2">Parties Involved:</span>
          {analysis.partiesInvolved.map((party, i) => (
            <span key={i} className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
              {party}
            </span>
          ))}
        </div>
      </div>

      {/* Comparison Narrative Block */}
      {analysis.comparisonAnalysis && !analysis.versionComparison && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-indigo-800 font-bold uppercase tracking-wide text-sm border-b border-indigo-200 pb-2">
            <Scale size={18} />
            <span>Analysis Insights</span>
          </div>
          <div className="prose prose-sm max-w-none text-indigo-900/80 leading-relaxed whitespace-pre-wrap font-medium">
            {analysis.comparisonAnalysis}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Chat (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Risk Detail Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden relative">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
              <AlertTriangle className="text-amber-500" size={20} />
              Risk Assessment
            </h3>
            
            <div className="mb-6 -mt-2">
              <RiskMeter score={analysis.riskScore} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100 transition-transform hover:scale-[1.02]">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk
                </span>
                <span className="text-xl font-bold text-red-700">{highRisks}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100 transition-transform hover:scale-[1.02]">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Risk
                </span>
                <span className="text-xl font-bold text-amber-700">{mediumRisks}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 transition-transform hover:scale-[1.02]">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-slate-400"></span> Missing Clauses
                </span>
                <span className="text-xl font-bold text-slate-700">{analysis.missingClauses.length}</span>
              </div>
            </div>
          </div>

          {/* Missing Clauses List */}
          {analysis.missingClauses.length > 0 && (
             <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
               <div className="flex items-center gap-2 mb-4 text-amber-900 font-bold text-sm uppercase tracking-wide">
                 <ShieldAlert size={18} className="text-amber-600" />
                 <span>Critical Missing Items</span>
               </div>
               <ul className="space-y-3">
                 {analysis.missingClauses.map((clause, idx) => (
                   <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed font-medium">
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 shadow-sm" />
                     {clause}
                   </li>
                 ))}
               </ul>
             </div>
          )}

           {/* Chat Component */}
           <ChatInterface analysis={analysis} />
        </div>

        {/* Right Column: Detailed Analysis (8 cols) */}
        <div className="lg:col-span-8">
          
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
            <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto no-scrollbar">
              {[
                { id: 'risks', label: 'Risks', icon: AlertTriangle, show: true },
                { id: 'diff', label: 'Version Diff', icon: GitCompare, show: !!(analysis.versionComparison && analysis.versionComparison.length > 0) },
                { id: 'compliance', label: 'Compliance', icon: ShieldCheck, show: true },
                { id: 'financial', label: 'Financials', icon: DollarSign, show: true },
                { id: 'obligations', label: 'Timeline', icon: Calendar, show: true },
                { id: 'fixes', label: 'Strategy', icon: Target, show: true },
              ].filter(t => t.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex-1 min-w-[110px] flex items-center justify-center gap-2 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap px-4
                    ${activeTab === tab.id 
                      ? 'border-blue-600 text-blue-700 bg-white' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex-1 bg-white relative">
              
              {/* Risks Tab */}
              {activeTab === 'risks' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="text-amber-500" />
                      Clause-by-Clause Risk Analysis
                    </h3>
                  </div>
                  
                  {analysis.risks.map((risk, index) => (
                    <div key={index} className="group relative border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-blue-200 bg-white">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                        risk.riskLevel === 'HIGH' ? 'bg-red-500' : 
                        risk.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></div>
                      
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`
                              px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm flex items-center gap-1.5
                              ${risk.riskLevel === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' : 
                                risk.riskLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                'bg-emerald-50 text-emerald-700 border-emerald-100'}
                            `}>
                               {risk.riskLevel === 'HIGH' && <XCircle size={10} />}
                               {risk.riskLevel === 'MEDIUM' && <AlertTriangle size={10} />}
                               {risk.riskLevel === 'LOW' && <CheckCircle size={10} />}
                               {risk.riskLevel} Risk
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              {risk.clauseReference}
                            </span>
                          </div>
                          <p className="text-slate-800 text-base leading-relaxed font-medium">{risk.description}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-start gap-3 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                        <ArrowRightCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-600">
                          <span className="font-bold text-slate-900 block mb-1">Recommendation</span>
                          {risk.recommendation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Version Diff Tab */}
              {activeTab === 'diff' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                     <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                       <GitCompare size={24} />
                     </div>
                     <h3 className="text-xl font-serif font-bold text-slate-900">Version Differences</h3>
                  </div>

                  {analysis.comparisonAnalysis && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-sm text-slate-700 leading-relaxed shadow-sm">
                      <span className="font-bold text-slate-900 block mb-2 text-base">Summary of Changes</span>
                      {analysis.comparisonAnalysis}
                    </div>
                  )}

                  {analysis.versionComparison && analysis.versionComparison.length > 0 ? (
                    <div className="space-y-5">
                      {analysis.versionComparison.map((diff, idx) => (
                        <div key={idx} className={`
                          relative border rounded-2xl p-6 transition-all hover:shadow-md
                          ${diff.changeType === 'ADDED' ? 'bg-emerald-50/30 border-emerald-100' : 
                            diff.changeType === 'REMOVED' ? 'bg-red-50/30 border-red-100' : 
                            'bg-blue-50/30 border-blue-100'}
                        `}>
                           <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-3">
                               {diff.changeType === 'ADDED' && <Plus size={18} className="text-emerald-600"/>}
                               {diff.changeType === 'REMOVED' && <Minus size={18} className="text-red-600"/>}
                               {diff.changeType === 'MODIFIED' && <Edit3 size={18} className="text-blue-600"/>}
                               <span className={`
                                 text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide
                                 ${diff.changeType === 'ADDED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                                   diff.changeType === 'REMOVED' ? 'bg-red-100 text-red-800 border-red-200' : 
                                   'bg-blue-100 text-blue-800 border-blue-200'}
                               `}>
                                 {diff.changeType}
                               </span>
                               <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                 {diff.clauseReference}
                               </span>
                             </div>
                           </div>
                           
                           <p className="text-slate-800 font-bold text-base mb-4 leading-relaxed">{diff.description}</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50">
                             <div className="bg-white/60 p-3 rounded-lg">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Impact</span>
                               <p className="text-sm text-slate-600 leading-relaxed font-medium">{diff.impact}</p>
                             </div>
                             <div className="bg-white/60 p-3 rounded-lg">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Negotiation Tip</span>
                               <p className="text-sm text-slate-600 leading-relaxed font-medium">{diff.negotiationTip}</p>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      No significant structural changes detected.
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Tab */}
              {activeTab === 'compliance' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                     <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                       <ShieldCheck size={24} />
                     </div>
                     <h3 className="text-xl font-serif font-bold text-slate-900">Compliance & Legal Checks</h3>
                  </div>

                  {analysis.complianceChecks && analysis.complianceChecks.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.complianceChecks.map((check, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row items-start gap-5 p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all">
                          <div className="flex-shrink-0 mt-1 bg-slate-50 p-2 rounded-full shadow-sm">
                            {check.status === 'PASS' && <CheckCircle className="text-emerald-500" size={24} />}
                            {check.status === 'WARNING' && <AlertTriangle className="text-amber-500" size={24} />}
                            {check.status === 'FAIL' && <XCircle className="text-red-500" size={24} />}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <h4 className="text-lg font-bold text-slate-800">{check.category}</h4>
                               <span className={`
                                  text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide
                                  ${check.status === 'PASS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    check.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                    'bg-red-50 text-red-700 border-red-100'}
                               `}>
                                 {check.status}
                               </span>
                             </div>
                             <p className="text-sm text-slate-600 leading-relaxed font-medium">{check.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      No specific compliance data returned.
                    </div>
                  )}
                </div>
              )}

              {/* Financial Analysis */}
              {activeTab === 'financial' && (
                <div className="animate-fade-in space-y-6">
                   <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                     <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                       <DollarSign size={24} />
                     </div>
                     <h3 className="text-xl font-serif font-bold text-slate-900">Financial Obligations</h3>
                   </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysis.financialTerms.map((term, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-7 hover:shadow-lg hover:border-emerald-200 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                              {term.category}
                            </span>
                          </div>
                          
                          <p className="text-slate-700 text-sm leading-relaxed mb-6 min-h-[40px] font-medium">
                            {term.details}
                          </p>
                          
                          {term.amount && (
                            <div className="pt-4 border-t border-slate-200/60">
                               <span className="text-3xl font-serif font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                 {term.amount}
                               </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {analysis.financialTerms.length === 0 && (
                      <div className="col-span-2 py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        <DollarSign className="mx-auto text-slate-300 mb-3" size={32} />
                        <p className="text-slate-500 font-medium">No specific financial terms extracted.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {activeTab === 'obligations' && (
                <div className="animate-fade-in pl-2">
                  <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
                     <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                       <Calendar size={24} />
                     </div>
                     <h3 className="text-xl font-serif font-bold text-slate-900">Obligation Timeline</h3>
                   </div>

                  <div className="relative border-l-2 border-slate-100 space-y-10 py-2 ml-3">
                    {analysis.obligations.map((obl, idx) => (
                      <div key={idx} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-6 w-5 h-5 bg-white border-4 border-blue-500 rounded-full group-hover:scale-125 transition-transform shadow-sm z-10"></div>
                        
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h5 className="font-bold text-slate-800 text-lg leading-snug">{obl.description}</h5>
                            {obl.dueDate && (
                              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 whitespace-nowrap flex items-center gap-1.5 w-fit">
                                <Calendar size={12} />
                                {obl.dueDate}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <FileText size={14} />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsibility</span>
                                <span className="text-slate-700 font-bold text-sm">{obl.responsibleParty}</span>
                              </div>
                            </div>
                            {obl.penalty && (
                               <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                 <AlertTriangle size={14} />
                               </div>
                               <div>
                                 <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Risk / Penalty</span>
                                 <span className="text-red-700 font-bold text-sm">{obl.penalty}</span>
                               </div>
                             </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy & Auto-Fix */}
              {activeTab === 'fixes' && (
                <div className="animate-fade-in space-y-10">
                  
                  {/* Recommendations */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Target size={24} />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-slate-900">Strategic Recommendations</h3>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-8 border border-indigo-100 shadow-sm">
                       <ul className="space-y-5">
                         {analysis.generalRecommendations && analysis.generalRecommendations.length > 0 ? (
                           analysis.generalRecommendations.map((rec, i) => (
                             <li key={i} className="flex items-start gap-4 text-slate-700">
                               <ArrowRightCircle size={20} className="text-indigo-500 mt-1 flex-shrink-0" />
                               <span className="font-medium text-base leading-relaxed">{rec}</span>
                             </li>
                           ))
                         ) : (
                           <li className="text-slate-400 italic">No general recommendations provided.</li>
                         )}
                       </ul>
                    </div>
                  </div>

                  {/* Auto-Fix Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Wrench size={24} />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-slate-900">Clause Auto-Fixes</h3>
                    </div>

                    <div className="space-y-8">
                      {analysis.autoFixes && analysis.autoFixes.length > 0 ? (
                        analysis.autoFixes.map((fix, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white">
                             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                               <span className="font-mono text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                 {fix.clauseReference}
                               </span>
                               <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2">
                                 <Edit3 size={14} /> Suggested Revision
                               </span>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                               <div className="p-6 bg-red-50/10">
                                 <h6 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                   <XCircle size={14} /> Original Context
                                 </h6>
                                 <p className="text-sm text-slate-600 italic leading-relaxed">
                                   "{fix.originalText || 'Original clause text...'}"
                                 </p>
                               </div>
                               <div className="p-6 bg-emerald-50/20">
                                 <h6 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                   <CheckCircle size={14} /> Improved Version
                                 </h6>
                                 <p className="text-sm text-slate-900 font-bold leading-relaxed">
                                   {fix.fixedText}
                                 </p>
                               </div>
                             </div>
                             <div className="bg-white p-6 border-t border-slate-200">
                               <p className="text-sm text-slate-600 flex flex-col sm:flex-row sm:gap-2">
                                 <span className="font-bold text-slate-800 whitespace-nowrap mb-1 sm:mb-0">Why this change?</span> 
                                 <span className="leading-relaxed">{fix.explanation}</span>
                               </p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                          No auto-fixes generated for this document.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-blue-600 transition-all z-50 animate-bounce-in"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default AnalysisDashboard;
