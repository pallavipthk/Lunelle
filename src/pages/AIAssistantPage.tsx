import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  Sparkles, 
  User, 
  Loader2, 
  Volume2, 
  Database,
  HeartHandshake,
  Copy,
  Check,
  RotateCcw,
  Stethoscope,
  Bookmark,
  ChevronRight,
  Flame,
  Moon,
  Apple,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { TextToSpeechPlayer } from '../components/TextToSpeechPlayer';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { EmergencyCheckResult } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  emergencyAlert?: EmergencyCheckResult;
  memoryConsulted?: boolean;
  suggestedFollowUps?: string[];
  copied?: boolean;
  saved?: boolean;
}

interface AIAssistantPageProps {
  onOpenVoiceModal: () => void;
}

type AssistantTone = 'gentle' | 'clinical' | 'nutrition';

/**
 * Strips raw markdown hashtags (#) and asterisks (*) for clean, friendly, cute reading
 */
function sanitizeCleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/(^|\s)[#*]+(\s|$)/g, '$1')
    .trim();
}

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onOpenVoiceModal }) => {
  const { profile, user } = useAuth();
  const userName = profile?.preferred_name || 'Friend';
  const userInitial = userName.charAt(0).toUpperCase();

  const [activeTone, setActiveTone] = useState<AssistantTone>('gentle');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      timestamp: formatCurrentTime(),
      text: `Hello ${userName}! ♡ I am your Lunelle Health Assistant.\n\nYou can ask me about lab test numbers, menstrual symptoms, PCOS, nutrition, or search your personal health records (e.g. "When did I last record a headache?", "Summarize my health").\n\nI understand English, Hindi, and Hinglish. Please feel free to ask whatever is on your mind!`,
      suggestedFollowUps: [
        'Meri report me Hb 9.5 hai iska kya matlab?',
        'Summarize my health',
        'When did I last record a headache?',
        'How to relieve menstrual cramps naturally?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsgId = `msg_u_${Date.now()}`;
    const newMsg: Message = { 
      id: userMsgId, 
      sender: 'user', 
      text,
      timestamp: formatCurrentTime()
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendAssistantMessage(text, activeTone);
      const cleanResponse = sanitizeCleanText(res.response);
      const assistantMsg: Message = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: cleanResponse,
        timestamp: formatCurrentTime(),
        emergencyAlert: res.emergencyDetails,
        memoryConsulted: res.memory?.hasRecords,
        suggestedFollowUps: (res as any).suggestedFollowUps
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          timestamp: formatCurrentTime(),
          text: 'I apologize, but I encountered a processing error. If this is an urgent health concern, please call 112 / 108 immediately.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmark = (msgId: string) => {
    setSavedId(msgId);
    setTimeout(() => setSavedId(null), 2500);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        timestamp: formatCurrentTime(),
        text: `Fresh session started. What would you like to discuss today, ${userName}?`,
        suggestedFollowUps: [
          'Summarize my health',
          'Meri report me Hb 9.5 hai iska kya matlab?',
          'How to reduce menstrual cramps naturally?'
        ]
      }
    ]);
  };

  const promptCategories = [
    { id: 'all', label: 'All Topics', icon: Sparkles },
    { id: 'labs', label: 'Blood & Labs', icon: FileSpreadsheet, query: 'Meri report me Hb 9.5 hai iska kya matlab?' },
    { id: 'cycle', label: 'Cycle & Cramps', icon: Moon, query: 'How to relieve menstrual cramps naturally?' },
    { id: 'summary', label: 'Health Summary', icon: Database, query: 'Summarize my health' },
    { id: 'nutrition', label: 'Diet & Iron', icon: Apple, query: 'What foods improve iron absorption?' },
    { id: 'energy', label: 'Fatigue & Energy', icon: Flame, query: 'Why do I feel tired even after 8 hours sleep?' }
  ];

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in font-cute pb-8">
      
      {/* AI Assistant Dedicated Claymorphic Box Container */}
      <div className="h-[740px] max-h-[85vh] flex flex-col bg-white rounded-[32px] border-2 border-[#E9E6DD] shadow-[0_16px_48px_-12px_rgba(52,83,68,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] overflow-hidden text-left relative">
        
        {/* Cute Header Bar with Tone Switcher and Actions */}
        <div className="px-6 py-3.5 border-b border-[#E9E6DD] bg-gradient-to-r from-[#FAF8F2] via-white to-[#FAF8F2] flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Avatar + Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] flex items-center justify-center text-[#345344] shadow-xs border border-[#A9BFA6]/40">
                <Bot className="w-5 h-5 text-[#345344]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#345344] leading-tight">
                  Lunelle Health Assistant
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DFE8DA]/60 text-[#345344] font-semibold border border-[#A9BFA6]/30">
                  Private & Verified
                </span>
              </div>
              <p className="text-[11px] text-[#778078] font-soft">
                Caring insights for symptoms, labs & records in English, Hindi & Hinglish
              </p>
            </div>
          </div>

          {/* Right: Tone Switcher & Reset Button */}
          <div className="flex items-center gap-2">
            
            {/* Tone Selector Pills */}
            <div className="flex items-center bg-[#FAF8F2] p-1 rounded-full border border-[#E9E6DD] text-[11px] font-medium text-[#778078]">
              <button
                type="button"
                onClick={() => setActiveTone('gentle')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  activeTone === 'gentle'
                    ? 'bg-white text-[#345344] font-bold shadow-2xs border border-[#E9E6DD]'
                    : 'hover:text-[#345344]'
                }`}
                title="Gentle, caring, empathetic response"
              >
                🌸 Gentle
              </button>
              <button
                type="button"
                onClick={() => setActiveTone('clinical')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  activeTone === 'clinical'
                    ? 'bg-white text-[#345344] font-bold shadow-2xs border border-[#E9E6DD]'
                    : 'hover:text-[#345344]'
                }`}
                title="Concise, clinical bullet points for doctor visits"
              >
                🩺 Clinical
              </button>
              <button
                type="button"
                onClick={() => setActiveTone('nutrition')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  activeTone === 'nutrition'
                    ? 'bg-white text-[#345344] font-bold shadow-2xs border border-[#E9E6DD]'
                    : 'hover:text-[#345344]'
                }`}
                title="Focus on diet, vitamins, and natural Indian remedies"
              >
                🥗 Nutrition
              </button>
            </div>

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-2 rounded-full text-[#778078] hover:text-[#345344] hover:bg-[#DFE8DA]/50 transition-colors cursor-pointer border border-transparent hover:border-[#E9E6DD]"
              title="Start New Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Category Carousel Pills Bar */}
        <div className="px-6 py-2 bg-[#FAF8F2]/70 border-b border-[#E9E6DD] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#778078] shrink-0">Topics:</span>
          {promptCategories.map(cat => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (cat.query) handleSendMessage(cat.query);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all cursor-pointer font-medium ${
                  isSelected
                    ? 'bg-[#345344] text-white shadow-2xs'
                    : 'bg-white text-[#556056] border border-[#E9E6DD] hover:bg-[#DFE8DA]/40 hover:text-[#345344]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Messages Chat Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-[#FAF8F2]/30 via-white to-[#FAF8F2]/40">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              
              {/* Left Bot Avatar for Assistant Messages */}
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] flex items-center justify-center text-[#345344] shrink-0 mt-1 border border-[#A9BFA6]/40 shadow-xs">
                  <Bot className="w-4 h-4 text-[#345344]" />
                </div>
              )}

              <div
                className={`max-w-xl flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Name & Timestamp Header */}
                <div className="flex items-center gap-2 px-1 mb-1 text-[10px] text-[#778078] font-medium">
                  <span>{msg.sender === 'user' ? userName : 'Lunelle Assistant'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-4 sm:p-5 rounded-2xl text-[13px] leading-relaxed transition-all relative ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#3D6250] to-[#2B4438] text-[#F6EACB] rounded-br-xs shadow-sm font-medium'
                      : 'bg-white border border-[#E9E6DD] text-[#303B33] rounded-bl-xs shadow-[0_4px_20px_-4px_rgba(52,83,68,0.06)]'
                  }`}
                >
                  {/* Emergency Alert inside chat if triggered */}
                  {msg.emergencyAlert && (
                    <div className="mb-3">
                      <EmergencyBanner emergency={msg.emergencyAlert} />
                    </div>
                  )}

                  {/* Memory consulted badge */}
                  {msg.memoryConsulted && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DFE8DA]/70 text-[#345344] text-[10px] font-bold mb-2.5 border border-[#A9BFA6]/40">
                      <Database className="w-3 h-3 text-[#345344]" />
                      <span>Verified Lunelle Health Records Referenced</span>
                    </div>
                  )}

                  {/* Formatted Message Text (Clean, no raw # or *) */}
                  <div className="whitespace-pre-line font-soft">
                    {sanitizeCleanText(msg.text)}
                  </div>

                  {/* Interactive Follow-up Question Chips */}
                  {msg.sender === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#E9E6DD]/80 space-y-2">
                      <p className="text-[10px] font-bold text-[#778078] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#A9BFA6]" />
                        <span>Explore related questions:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((fu, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(fu)}
                            className="text-[11px] font-semibold text-[#345344] bg-[#FAF8F2] hover:bg-[#DFE8DA]/70 px-3 py-1 rounded-full border border-[#E9E6DD] transition-all cursor-pointer hover:border-[#A9BFA6]"
                          >
                            ✦ {fu}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Actions Bar: Copy, Audio, Doctor Discussion */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-3.5 pt-2.5 border-t border-[#E9E6DD]/60 flex flex-wrap items-center justify-between gap-2">
                      
                      <div className="flex items-center gap-2">
                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium text-[#778078] hover:text-[#345344] hover:bg-[#FAF8F2] border border-transparent hover:border-[#E9E6DD] transition-all cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Save to Notes */}
                        <button
                          type="button"
                          onClick={() => handleBookmark(msg.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium text-[#778078] hover:text-[#345344] hover:bg-[#FAF8F2] border border-transparent hover:border-[#E9E6DD] transition-all cursor-pointer"
                          title="Bookmark advice"
                        >
                          {savedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#345344]" />
                              <span className="text-[#345344] font-semibold">Saved!</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3" />
                              <span>Bookmark</span>
                            </>
                          )}
                        </button>

                        {/* Text to Speech */}
                        <TextToSpeechPlayer textToRead={msg.text} label="Listen" />
                      </div>

                      <span className="text-[10px] text-[#A0A8A1] font-accent italic">
                        Informational guidance • Consult doctor
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Avatar for User Messages */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B77D78] to-[#9E6560] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 shadow-xs">
                  {userInitial}
                </div>
              )}

            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] flex items-center justify-center text-[#345344] shrink-0 border border-[#A9BFA6]/40 shadow-xs">
                <Bot className="w-4 h-4 text-[#345344]" />
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#778078] bg-white p-3.5 px-4 rounded-2xl border border-[#E9E6DD] shadow-xs">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#345344] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#A9BFA6] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#DFE8DA] animate-bounce" />
                </div>
                <span className="font-medium text-[11px]">Thinking with care...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 px-6 bg-white border-t border-[#E9E6DD] flex items-center gap-3"
        >
          {/* Voice Dictation Launcher */}
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="p-2.5 rounded-full bg-[#DFE8DA]/60 text-[#345344] hover:bg-[#DFE8DA] transition-colors cursor-pointer border border-[#A9BFA6]/40 hover:scale-105 active:scale-95"
            title="Voice Dictation (Hinglish / Hindi / English)"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Ask a question in English, Hindi, or Hinglish...`}
            className="flex-1 px-4 py-2.5 text-xs rounded-full border border-[#E9E6DD] bg-[#FFFEFC] focus:border-[#345344] focus:outline-none focus:ring-1 focus:ring-[#345344] text-[#303B33] font-soft placeholder:text-[#A0A8A1]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-b from-[#3D6250] to-[#2B4438] text-[#F6EACB] text-xs font-semibold hover:shadow-md transition-all disabled:opacity-40 cursor-pointer shadow-xs hover:scale-105 active:scale-95"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
