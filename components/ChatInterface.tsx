import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ArrowRight, Sparkles, User, Bot } from 'lucide-react';
import { askFollowUpQuestion } from '../services/geminiService';
import { ContractAnalysis } from '../types';

interface ChatInterfaceProps {
  analysis: ContractAnalysis;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ analysis }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatting]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsChatting(true);

    try {
      // Prepare context from analysis
      const context = JSON.stringify({
        summary: analysis.summary,
        risks: analysis.risks,
        obligations: analysis.obligations,
        missing: analysis.missingClauses
      });
      
      const response = await askFollowUpQuestion(newHistory, chatInput, context);
      
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "I apologize, but I encountered an error responding to your request." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px] overflow-hidden sticky top-24">
      <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600" />
          Legal Assistant
        </h3>
        <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-full">Gemini 3 Pro</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 px-6 space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-2">
              <MessageSquare size={24} />
            </div>
            <p className="text-sm font-medium text-slate-600">How can I help with this contract?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Explain the indemnity clause", "Draft a safer termination clause", "What are the payment terms?"].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => setChatInput(suggestion)}
                  className="text-xs bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
              ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isChatting && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
               <Bot size={14} />
             </div>
             <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask to rewrite, explain, or summarize..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none"
          />
          <button 
            type="submit"
            disabled={!chatInput.trim() || isChatting}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
