import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { aiAPI, subjectsAPI, conceptsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Code2,
  Lightbulb,
  Scale,
  MessageSquare,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: 'Explain simply (ELI5)', icon: Lightbulb, prompt: 'Can you explain this simply like I am a beginner?' },
  { label: 'Give practical example', icon: Code2, prompt: 'Give me a concrete real-world engineering code example.' },
  { label: 'Compare with alternative', icon: Scale, prompt: 'Compare this concept with adjacent alternatives and outline trade-offs.' },
  { label: 'Test my knowledge', icon: HelpCircle, prompt: 'Quiz me on this concept to test my mental model!' },
];

const AITutorPage = () => {
  const location = useLocation();
  const { showToast } = useNotification();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Context selection
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [conceptContext, setConceptContext] = useState(location.state?.conceptName || '');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Load conversations on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          aiAPI.getConversations(),
          subjectsAPI.getAll(),
        ]);
        const convList = cRes.data.data || [];
        setConversations(convList);
        setSubjects(sRes.data.data || []);

        if (convList.length > 0) {
          loadConversation(convList[0]);
        } else {
          startNewConversation();
        }
      } catch (err) {
        console.warn('Tutor init warning', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadConversation = (conv) => {
    setActiveConvId(conv._id);
    setMessages(conv.messages || []);
    if (conv.subjectId) setSelectedSubjectId(conv.subjectId._id || conv.subjectId);
    if (conv.conceptId) setConceptContext(conv.conceptId.name || '');
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([
      {
        role: 'assistant',
        content: `Greetings! I am your **Cosmic AI Tutor**.\n\nI can explain complex data structures, deconstruct operating system mechanisms, or generate practical code examples. What concept shall we explore today?`,
        timestamp: new Date(),
        metadata: { aiProvider: 'Cosmic Intelligence Engine' },
      },
    ]);
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    try {
      await aiAPI.deleteConversation(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeConvId === id) {
        startNewConversation();
      }
      showToast('Conversation cleared', 'info');
    } catch (err) {
      showToast('Could not delete conversation', 'error');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await aiAPI.tutorChat({
        conversationId: activeConvId,
        message: query,
        subjectId: selectedSubjectId || null,
        conceptId: null,
      });

      const { data } = res.data;
      if (!activeConvId && data.conversationId) {
        setActiveConvId(data.conversationId);
        // Refresh conversation list
        const updatedList = await aiAPI.getConversations();
        setConversations(updatedList.data.data || []);
      }

      setMessages(data.messages || [
        ...messages,
        userMsg,
        {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          metadata: { aiProvider: data.aiProvider, isDemoMode: data.isDemoMode },
        },
      ]);
    } catch (err) {
      showToast('Error getting tutor reply', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex gap-6 max-w-7xl mx-auto overflow-hidden">
      {/* Sidebar: Conversation Sessions */}
      <div className="hidden md:flex flex-col w-72 cosmic-panel rounded-3xl p-4 border border-cosmic-border shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-bold text-white">
            <MessageSquare className="w-4 h-4 text-cosmic-violet" />
            <span>Chat Sessions</span>
          </div>
          <button
            onClick={startNewConversation}
            className="p-1.5 rounded-xl bg-cosmic-violet/20 hover:bg-cosmic-violet/30 text-cosmic-violet transition-colors"
            title="Start New Session"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-1">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => loadConversation(conv)}
              className={`p-3 rounded-2xl text-xs font-medium cursor-pointer transition-all flex items-center justify-between group ${
                activeConvId === conv._id
                  ? 'bg-gradient-to-r from-cosmic-violet/25 to-cosmic-indigo/20 text-white border border-cosmic-violet/40 shadow-cosmic-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="truncate pr-2">
                <div className="truncate font-semibold">{conv.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(e, conv._id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col cosmic-panel rounded-3xl border border-cosmic-border overflow-hidden">
        {/* Chat Header / Subject Context Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cosmic-indigo to-cosmic-violet flex items-center justify-center shadow-cosmic-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Cosmic AI Personal Tutor</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono">
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Context-aware conversational assistance</p>
            </div>
          </div>

          {/* Subject Context Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cosmic-violet outline-none"
            >
              <option value="">General CS Foundations</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs'
                    : 'bg-slate-900 border border-cosmic-violet/40 text-cosmic-violet shadow-cosmic-sm'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}>
                {/* Engine Badge if Assistant */}
                {msg.role === 'assistant' && msg.metadata?.aiProvider && (
                  <div className="text-[10px] font-mono text-slate-500 mb-2 flex items-center justify-between">
                    <span>Engine: {msg.metadata.aiProvider}</span>
                    <button
                      onClick={() => copyToClipboard(msg.content, idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {msg.role === 'user' ? (
                  <div className="whitespace-pre-line leading-relaxed font-sans">{msg.content}</div>
                ) : (
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-base font-bold text-white mt-3 mb-1.5" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-white mt-2.5 mb-1" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-xs sm:text-sm font-bold text-cosmic-cyan mt-2 mb-1" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-xs font-bold text-purple-300 mt-1.5 mb-0.5" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-200" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-200" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-200" {...props} />,
                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code className="px-1.5 py-0.5 rounded bg-slate-950 text-cosmic-cyan font-mono text-xs border border-slate-800" {...props} />
                          ) : (
                            <pre className="p-3 my-2 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-xs font-mono text-emerald-400">
                              <code {...props} />
                            </pre>
                          ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-2 border-cosmic-violet pl-3 my-2 text-slate-300 italic bg-cosmic-violet/10 py-1 rounded-r-lg" {...props} />
                        ),
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-2.5">
                            <table className="min-w-full divide-y divide-slate-800 border border-slate-800 rounded-lg text-xs" {...props} />
                          </div>
                        ),
                        th: ({ node, ...props }) => <th className="px-3 py-1.5 bg-slate-950 font-bold text-slate-200 text-left border-b border-slate-800" {...props} />,
                        td: ({ node, ...props }) => <td className="px-3 py-1.5 border-b border-slate-800/60 text-slate-300" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                <div className="text-[10px] text-slate-400/70 text-right mt-1.5 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-cosmic-violet/40 text-cosmic-violet flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cosmic-violet animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cosmic-violet animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cosmic-violet animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto">
          {QUICK_PROMPTS.map((qp, i) => {
            const Icon = qp.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(qp.prompt)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center space-x-1.5 whitespace-nowrap transition-colors"
              >
                <Icon className="w-3 h-3 text-cosmic-cyan" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end space-x-3"
          >
            <div className="flex-1 relative">
              <textarea
                rows="1"
                placeholder="Ask the AI Tutor anything about your coursework... (Enter to send, Shift+Enter for new line)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cosmic-violet text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner resize-none min-h-[48px] max-h-32"
              />
              <div className="text-[10px] text-slate-500 mt-1 pl-2">
                Press <span className="text-slate-400 font-mono">Enter</span> to send, <span className="text-slate-400 font-mono">Shift + Enter</span> for new line
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-cosmic-indigo to-cosmic-violet text-white shadow-cosmic-sm hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all mb-5 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;
