import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Terminal, User, Cpu, Sparkles, Settings as SettingsIcon, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Menu, RefreshCw, Headphones, Wand2, Globe, Pencil, Zap, ZapOff, Eye, EyeOff } from 'lucide-react';
import { sendMessageStream, initChatSession, summarizeHistory } from '../lib/gemini';
import { useGame, Message } from '../contexts/GameContext';
import { cn } from '../lib/utils';
import SettingsPanel from './SettingsPanel';
import AudiobookModal from './AudiobookModal';
import CreationInterface from './CreationInterface';
import CodexPanel from './CodexPanel';
import { motion, AnimatePresence } from 'motion/react';

export default function ChatInterface() {
  const { gameState, setGameState, aiConfig, setAiConfig, gameConfig, setGameConfig, updateStateFromAI, aiStatus, setAiStatus } = useGame();
  
  const toggleResponseMode = () => {
    setGameConfig(prev => ({
      ...prev,
      responseMode: prev.responseMode === 'streaming' ? 'full' : 'streaming'
    }));
  };
  const actionInputRef = useRef<{ setInputValue: (val: string) => void }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudiobookOpen, setIsAudiobookOpen] = useState(false);
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(gameState.currentPage || 1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringScroll = useRef(false);

  // Sync with global state (for resets)
  useEffect(() => {
    if (gameState.currentPage) {
      setCurrentPage(gameState.currentPage);
    }
  }, [gameState.currentPage]);

  // Pagination logic
  const turns = useMemo(() => gameState.messages.filter(m => m.role === 'assistant'), [gameState.messages]);
  const totalTurns = turns.length;
  const turnsPerPage = 3;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalTurns / turnsPerPage)), [totalTurns, turnsPerPage]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Save current page
  useEffect(() => {
    if (currentPage !== undefined && currentPage !== null) {
      localStorage.setItem('grok_current_page', currentPage.toString());
    }
  }, [currentPage]);

  // Restore scroll position
  useEffect(() => {
    const savedScroll = localStorage.getItem(`grok_scroll_page_${currentPage}`);
    isRestoringScroll.current = true;
    
    const timer = setTimeout(() => {
      if (mainRef.current) {
        if (savedScroll) {
          mainRef.current.scrollTop = parseInt(savedScroll, 10);
        } else {
          mainRef.current.scrollTop = 0;
        }
      }
      const innerTimer = setTimeout(() => {
        isRestoringScroll.current = false;
      }, 100);
      return () => clearTimeout(innerTimer);
    }, 10);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const handleScroll = useCallback(() => {
    if (isRestoringScroll.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (mainRef.current && !isRestoringScroll.current && currentPage !== undefined && currentPage !== null) {
        localStorage.setItem(`grok_scroll_page_${currentPage}`, mainRef.current.scrollTop.toString());
      }
    }, 100);
  }, [currentPage]);

  const currentMessages = useMemo(() => {
    return gameState.messages.filter(msg => {
      if (msg.id === 'initial') return currentPage === 1;
      const msgIndex = gameState.messages.findIndex(m => m.id === msg.id);
      const assistantCountBefore = gameState.messages.slice(0, msgIndex + 1).filter(m => m.role === 'assistant').length;
      const turnNumber = msg.role === 'assistant' ? assistantCountBefore : assistantCountBefore + 1;
      
      return turnNumber > (currentPage - 1) * turnsPerPage && turnNumber <= currentPage * turnsPerPage;
    });
  }, [gameState.messages, currentPage, turnsPerPage]);

  // Automatic Memory Compression logic
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const performSummarization = useCallback(async (customStartIdx?: number, customEndIdx?: number) => {
    if (isSummarizing) return;
    
    setIsSummarizing(true);
    try {
      const messageCount = gameState.messages.length;
      const summaryCount = (gameState.summaries || []).length;
      
      const startIdx = customStartIdx !== undefined ? customStartIdx : summaryCount * 30;
      // Summary up to the second to last message pair to keep immediate context
      const endIdx = customEndIdx !== undefined ? customEndIdx : Math.max(0, messageCount - 2);

      console.log(`Manual compression requested: Summarizing messages ${startIdx} to ${endIdx}`);
      setAiStatus(prev => ({ ...prev, currentMethod: "Hệ thống: Đang nén ký ức tích lũy..." }));

      if (endIdx > startIdx + 1) { 
        const messagesToSummarize = gameState.messages.slice(startIdx, endIdx).map(m => ({
          role: m.role,
          content: m.content
        }));

        if (messagesToSummarize.length > 0) {
          const result = await summarizeHistory(messagesToSummarize, aiConfig, gameConfig);
          if (result) {
            setGameState(prev => ({
              ...prev,
              summaries: [...(prev.summaries || []), result.trim()]
            }));
            setAiStatus(prev => ({ ...prev, currentMethod: "Hệ thống: Nén ký ức thành công!" }));
            return true;
          } else {
            setAiStatus(prev => ({ ...prev, currentMethod: "Lỗi: Không thể nén ký ức lúc này" }));
          }
        }
      } else {
        setAiStatus(prev => ({ ...prev, currentMethod: "Chưa đủ dữ liệu mới để nén" }));
      }
    } catch (err) {
      console.error("Compression failed:", err);
      setAiStatus(prev => ({ ...prev, currentMethod: "Lỗi nén ký ức!" }));
    } finally {
      setIsSummarizing(false);
    }
    return false;
  }, [gameState.messages, gameState.summaries, isSummarizing, aiConfig, setGameState]);

  useEffect(() => {
    // Auto trigger: if unsummarized messages > 30 (15 turns)
    const messageCount = gameState.messages.length;
    const summaryCount = (gameState.summaries || []).length;
    const processedCount = summaryCount * 30;
    
    if (messageCount - processedCount > 35 && !isSummarizing) {
      performSummarization();
    }
  }, [gameState.messages.length, gameState.summaries?.length, isSummarizing, performSummarization]);

  useEffect(() => {
    initChatSession(aiConfig, gameConfig);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLatest = () => {
    latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e?: React.FormEvent, overrideContent?: string, historyOverride?: Message[]) => {
    if (e) e.preventDefault();
    const userMessage = overrideContent;
    if (!userMessage || isLoading) return;

    setIsLoading(true);

    const newTotalTurns = totalTurns + 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotalTurns / turnsPerPage));

    // If we are not on the last page, jump to it
    if (currentPage !== newTotalPages) {
      setCurrentPage(newTotalPages);
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage, displayContent: userMessage };
    const assistantMsgId = (Date.now() + 1).toString();
    const newAssistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', displayContent: '' };

    setIsInputVisible(false); // Auto hide input when generating

    const history = historyOverride || gameState.messages;

    setGameState(prev => ({
      ...prev,
      messages: [...history, newUserMsg, newAssistantMsg]
    }));

    setTimeout(() => scrollToLatest(), 100);

    try {
      // Slidding window: Always send context summaries + last 20 messages for maximum stability
      const contextSummaries = gameState.summaries || [];
      const messagesForApi = [...history, newUserMsg]
        .filter(m => m.id !== 'initial')
        .slice(-20) // Only send the last 20 messages to GEMINI to save context and prevent confusion
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const stream = sendMessageStream(
        messagesForApi, 
        aiConfig, 
        gameConfig,
        (method, error) => {
          setAiStatus(prev => {
            if (error) {
              return {
                ...prev,
                errors: [...prev.errors, { method, error, time: new Date().toLocaleTimeString() }]
              };
            }
            return { ...prev, currentMethod: method };
          });
        },
        () => {
          setAiConfig(prev => ({ ...prev, currentKeyIndex: prev.currentKeyIndex + 1 }));
        },
        contextSummaries
      );
      
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        
        let displayContent = fullContent;
        const stateMatch = fullContent.match(/===STATE_UPDATE===\n([\s\S]*?)\n===END_STATE_UPDATE===/);
        if (stateMatch) {
          displayContent = fullContent.replace(/===STATE_UPDATE===\n[\s\S]*?\n===END_STATE_UPDATE===/, '').trim();
        } else if (fullContent.includes('===STATE_UPDATE===')) {
           displayContent = fullContent.split('===STATE_UPDATE===')[0].trim();
        }

        // Fallback: Clean up unwanted labels if AI still generates them
        displayContent = displayContent
          .replace(/^(Suy nghĩ|Hội thoại|Nói|Đáp|Lời nói|Nghĩ thầm|Tâm niệm):\s*/gim, '')
          .replace(/\n(Suy nghĩ|Hội thoại|Nói|Đáp|Lời nói|Nghĩ thầm|Tâm niệm):\s*/gim, '\n')
          .replace(/>\s*(Suy nghĩ|Hội thoại|Nói|Đáp|Lời nói|Nghĩ thầm|Tâm niệm):\s*/gim, '> ');

        setGameState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => 
            msg.id === assistantMsgId 
              ? { ...msg, content: fullContent, displayContent }
              : msg
          )
        }));
        
        // Auto scroll to the start of the new message if it's long
        if (fullContent.length < 500) {
           scrollToBottom();
        }
      }

      const finalMatches = Array.from(fullContent.matchAll(/===STATE_UPDATE===\n([\s\S]*?)\n===END_STATE_UPDATE===/g));
      if (finalMatches.length > 0) {
        const lastMatch = finalMatches[finalMatches.length - 1];
        if (lastMatch && lastMatch[1]) {
          updateStateFromAI(lastMatch[1]);
        }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (isLoading) return;
    
    // Find the last user message index in the entire message list
    const lastUserMsgIndex = [...gameState.messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return;
    
    const actualIndex = gameState.messages.length - 1 - lastUserMsgIndex;
    const lastUserMsg = gameState.messages[actualIndex];
    
    // Remove all messages from this user message onwards
    const newHistory = gameState.messages.slice(0, actualIndex);
    
    // Trigger submit with the content and the truncated history
    handleSubmit(undefined, lastUserMsg.content, newHistory);
  };

  const handleEditLastAction = () => {
    if (isLoading) return;
    
    // Tìm tin nhắn cuối cùng của người dùng
    const lastUserMsgIndex = [...gameState.messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return;
    
    const actualIndex = gameState.messages.length - 1 - lastUserMsgIndex;
    const lastUserMsg = gameState.messages[actualIndex];
    
    // Đưa nội dung vào ô nhập
    actionInputRef.current?.setInputValue(lastUserMsg.content);
    
    // Xóa tất cả tin nhắn từ lượt này trở đi (giống regenerate nhưng không submit ngay)
    const newHistory = gameState.messages.slice(0, actualIndex);
    setGameState(prev => ({
      ...prev,
      messages: newHistory
    }));
    
    // Hiện khung nhập và cuộn xuống
    setIsInputVisible(true);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const themeClass = useMemo(() => {
    const genre = (gameConfig.genre || '').toLowerCase();
    const location = (gameState.character.location || '').toLowerCase();
    
    if (location.includes('ngục') || location.includes('ma hố') || location.includes('horror')) return 'theme-horror';
    if (genre.includes('tiên') || genre.includes('huyền huyễn')) return 'theme-tutiên';
    if (genre.includes('cyber') || genre.includes('sci-fi')) return 'theme-cyberpunk';
    if (genre.includes('fantasy') || genre.includes('dị thế')) return 'theme-fantasy';
    return 'theme-tutiên';
  }, [gameConfig.genre, gameState.character.location]);

  return (
    <div className={cn("flex h-screen text-[#E4E3E0] font-sans overflow-hidden transition-colors duration-1000", themeClass)}>
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#112240] border-r border-[#1d2d50] transform transition-transform duration-300 ease-in-out flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-[#1d2d50] flex justify-between items-center">
          <h2 className="text-[#F27D26] font-bold uppercase tracking-wider text-sm">Danh sách Lượt</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-[#8E9299] hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {Array.from({ length: Math.ceil(totalTurns / 10) }).map((_, groupIdx) => {
            const start = groupIdx * 10 + 1;
            const end = Math.min((groupIdx + 1) * 10, totalTurns);
            const isExpanded = expandedGroup === groupIdx;
            const hasActiveTurn = turns.slice(start - 1, end).some((_, idx) => {
              const turnNum = start + idx;
              const pageForTurn = Math.ceil(turnNum / turnsPerPage);
              return currentPage === pageForTurn && turnNum > (currentPage - 1) * turnsPerPage && turnNum <= currentPage * turnsPerPage;
            });

            return (
              <div key={groupIdx} className="space-y-1">
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : groupIdx)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-bold transition-all",
                    isExpanded || hasActiveTurn
                      ? "bg-[#1d2d50]/50 text-[#F27D26] border border-[#1d2d50]"
                      : "text-[#8E9299] hover:bg-[#141414] hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 opacity-50" />
                    Lượt {start} - {end}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
                </button>

                {isExpanded && (
                  <div className="pl-4 space-y-1 animate-[fadeIn_0.2s_ease-out]">
                    {Array.from({ length: end - start + 1 }).map((_, idx) => {
                      const turnNum = start + idx;
                      const pageForTurn = Math.ceil(turnNum / turnsPerPage);
                      const isActive = turnNum > (currentPage - 1) * turnsPerPage && turnNum <= currentPage * turnsPerPage;

                      return (
                        <button
                          key={turnNum}
                          onClick={() => {
                            setCurrentPage(pageForTurn);
                            setIsSidebarOpen(false);
                            setTimeout(() => {
                              const turnMsg = turns[turnNum - 1];
                              if (turnMsg) {
                                const element = document.getElementById(`message-${turnMsg.id}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }
                            }, 100);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 rounded-lg text-xs transition-colors relative",
                            isActive
                              ? "bg-[#141414] text-[#F27D26] border border-[#333]"
                              : "text-[#8E9299] hover:bg-[#141414] hover:text-white"
                          )}
                        >
                          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#F27D26] rounded-r-full" />}
                          Lượt {turnNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {totalTurns === 0 && (
            <div className="text-center py-8 text-[#8E9299] text-xs italic">
              Chưa có lượt chơi nào.
            </div>
          )}
        </div>
      </div>

      {/* Toggle Header Button (Floating) */}
      <AnimatePresence>
        {!isHeaderVisible && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => setIsHeaderVisible(true)}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 p-2.5 bg-[#F27D26] text-[#112240] rounded-full shadow-[0_0_15px_rgba(242,125,38,0.5)] active:scale-95 transition-transform"
            title="Hiện thanh công cụ"
          >
            <ChevronDown className="w-6 h-6 stroke-[3px]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <AnimatePresence>
          {isHeaderVisible && (
            <motion.header 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#1d2d50] bg-[#112240] z-10 relative group"
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 -ml-2 text-[#8E9299] hover:text-white md:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden md:flex w-10 h-10 rounded-full bg-[#141414] border border-[#333] items-center justify-center cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  <Menu className="w-5 h-5 text-[#F27D26]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wide uppercase text-white flex items-center gap-2">
                    Grok <span className="text-[#F27D26]">RPG Engine</span>
                  </h1>
                  <p className="text-xs text-[#8E9299] font-mono uppercase tracking-widest">Powered by {gameConfig.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8E9299]">
                    <span className={cn("w-2 h-2 rounded-full animate-pulse", aiStatus.errors.length > 0 ? "bg-red-500" : "bg-[#00FF00]")}></span>
                    {aiStatus.currentMethod}
                  </div>
                  {aiStatus.errors.length > 0 && (
                    <button onClick={() => setIsErrorModalOpen(true)} className="text-[10px] text-red-400 hover:underline mt-1">
                      {aiStatus.errors.length} Lỗi kết nối (Nhấn để xem)
                    </button>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#8E9299] border-l border-[#333] pl-4">
                  {gameConfig.genre} | {gameConfig.style}
                </div>
                <button 
                  onClick={() => setIsCodexOpen(true)}
                  className="p-2 bg-[#141414] border border-[#333] rounded-lg hover:bg-[#222] hover:text-[#F27D26] transition-colors relative"
                  title="Mở Sổ Tay Thế Giới"
                >
                  <Globe className="w-5 h-5 animate-pulse-slow" />
                </button>
                <button 
                  onClick={() => setIsAudiobookOpen(true)}
                  className="p-2 bg-[#141414] border border-[#333] rounded-lg hover:bg-[#222] hover:text-[#F27D26] transition-colors"
                  title="Xuất Sách & Nghe Truyện"
                >
                  <Headphones className="w-5 h-5" />
                </button>
                <button 
                  onClick={toggleResponseMode}
                  className={cn(
                    "p-2 border transition-all duration-300 rounded-lg flex items-center gap-2",
                    gameConfig.responseMode === 'streaming' 
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20" 
                      : "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                  )}
                  title={gameConfig.responseMode === 'streaming' ? "Chế độ: Phát trực tuyến (Streaming)" : "Chế độ: Phản hồi toàn bộ (Full Response)"}
                >
                  {gameConfig.responseMode === 'streaming' ? (
                    <Zap className="w-5 h-5 fill-current" />
                  ) : (
                    <ZapOff className="w-5 h-5" />
                  )}
                  <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">
                    {gameConfig.responseMode === 'streaming' ? "Streaming" : "Full"}
                  </span>
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 bg-[#141414] border border-[#333] rounded-lg hover:bg-[#222] hover:text-white transition-colors"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Explicit Collapse Button at Bottom of Header */}
              <button 
                onClick={() => setIsHeaderVisible(false)}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 p-2 bg-[#1d2d50] text-[#F27D26] rounded-full border border-[#333] shadow-lg active:scale-95 transition-transform"
                title="Ẩn thanh công cụ"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </motion.header>
          )}
        </AnimatePresence>

        {/* World Status Pulse Bar (Suggestion 1) */}
        {gameState.world_events.length > 0 && (
          <div className="bg-[#1d2d50]/30 border-b border-[#1d2d50]/50 py-1.5 px-4 overflow-hidden relative">
            <div className="flex items-center gap-4 whitespace-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
              {gameState.world_events.map((event, i) => {
                const eventText = typeof event === 'string' ? event : (event && typeof event === 'object' ? ((event as any).description || (event as any).name || JSON.stringify(event)) : String(event));
                return (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-[#F27D26] opacity-70">
                  <Sparkles className="w-3 h-3" />
                  {eventText}
                </div>
              )})}
              {/* Duplicate for seamless marquee */}
              {gameState.world_events.map((event, i) => {
                const eventText = typeof event === 'string' ? event : (event && typeof event === 'object' ? ((event as any).description || (event as any).name || JSON.stringify(event)) : String(event));
                return (
                <div key={`dup-${i}`} className="flex items-center gap-2 text-[10px] font-mono text-[#F27D26] opacity-70">
                  <Sparkles className="w-3 h-3" />
                  {eventText}
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <main 
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 md:p-8"
        >
          {/* Pagination Controls Top */}
          {totalPages > 1 && (
            <div className="max-w-4xl mx-auto flex justify-center items-center gap-4 mb-8">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 text-[#8E9299] hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono text-[#8E9299]">Trang {currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-[#8E9299] hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {currentMessages.map((msg, index) => {
              const isLatestAssistant = msg.role === 'assistant' && msg.id === gameState.messages[gameState.messages.length - 1]?.id;
              
              if (msg.role === 'assistant' && !msg.content && isLatestAssistant && isLoading) {
                return null;
              }

              const lastUserMessage = [...gameState.messages].reverse().find(m => m.role === 'user');
              const isLastUserMessage = msg.id === lastUserMessage?.id;
              
              return (
              <div 
                key={msg.id} 
                id={`message-${msg.id}`}
                ref={isLatestAssistant ? latestMessageRef : null}
                className={cn(
                  "flex gap-4 md:gap-6 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border",
                      "bg-[#141414] border-[#333] text-white" 
                    )}>
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                )}

                {/* Message Content */}
                {msg.role === 'user' ? (
                  <div className="flex flex-col items-end max-w-[85%]">
                    <div className="bg-[#141414] border border-[#222] text-[#E4E3E0] shadow-lg p-5 md:p-6 rounded-2xl w-full">
                      <p className="whitespace-pre-wrap text-sm md:text-base">{msg.displayContent || msg.content}</p>
                    </div>
                    {isLastUserMessage && !isLoading && (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleRegenerate}
                          className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8E9299] hover:text-[#F27D26] transition-colors group"
                        >
                          <RefreshCw className="w-3 h-3 group-hover:animate-spin" /> Roll lại lượt này
                        </button>
                        <button 
                          onClick={handleEditLastAction}
                          className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8E9299] hover:text-[#F27D26] transition-colors group"
                        >
                          <Pencil className="w-3 h-3" /> Sửa hành động
                        </button>
                      </div>
                    )}
                  </div>
                ) : (() => {
                  let textToRender = msg.displayContent || msg.content;
                  let titleText = null;
                  let worldEvents: string[] = [];
 
                  // Extract complete title(s)
                  const titleRegex = /\[TITLE\]([\s\S]*?)\[\/TITLE\]/gi;
                  const allTitles = Array.from(textToRender.matchAll(titleRegex));
                  
                  if (allTitles.length > 0) {
                    titleText = allTitles[0][1].trim();
                    textToRender = textToRender.replace(titleRegex, '').trim();
                  } else {
                    const partialMatch = textToRender.match(/\[TITLE\]([\s\S]*?)$/i);
                    if (partialMatch) {
                      titleText = partialMatch[1].trim();
                      textToRender = textToRender.replace(partialMatch[0], '').trim();
                    }
                  }

                  // Extract complete world events
                  const worldEventRegex = /\[WORLD_EVENT\]([\s\S]*?)\[\/WORLD_EVENT\]/gi;
                  const allEvents = Array.from(textToRender.matchAll(worldEventRegex));
                  if (allEvents.length > 0) {
                    worldEvents = allEvents.map(e => e[1].trim());
                    textToRender = textToRender.replace(worldEventRegex, '').trim();
                  } else {
                    const partialEventMatch = textToRender.match(/\[WORLD_EVENT\]([\s\S]*?)$/i);
                    if (partialEventMatch) {
                      // While streaming, just hide the partial tag and its content until it's wrapped
                      textToRender = textToRender.replace(partialEventMatch[0], '').trim();
                    }
                  }

                  return (
                  <div className="flex-1 rounded-2xl bg-transparent text-[#D1D1D1] max-w-full">
                    {titleText && (
                      <div className="mb-8 text-center animate-[slamIn_0.5s_ease-out_forwards]">
                        <div className="inline-block relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 blur-xl opacity-30 rounded-2xl"></div>
                          <div className="relative px-6 py-4 rounded-xl bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(242,125,38,0.15)] flex flex-col items-center">
                            <span className="text-[10px] text-[#8E9299] font-mono uppercase tracking-[0.3em] mb-2 relative z-10">
                              Lượt {index + (currentPage - 1) * turnsPerPage + 1}
                            </span>
                            <h2 className="text-xl md:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B6B] via-[#F27D26] to-[#C5A059] drop-shadow-sm text-center relative z-10">
                              {titleText}
                            </h2>
                          </div>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-4">
                          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#F27D26]/50"></div>
                          <div className="w-2 h-2 rotate-45 border border-[#F27D26] bg-[#141414]"></div>
                          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#F27D26]/50"></div>
                        </div>
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none
                      text-[18px] text-justify leading-relaxed
                      prose-p:indent-8 prose-p:mb-6
                      prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                      prose-a:text-[#F27D26] prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-white prose-strong:font-semibold
                      prose-code:text-[#F27D26] prose-code:bg-[#141414] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-[#050505] prose-pre:border prose-pre:border-[#222] prose-pre:text-[#E4E3E0] prose-pre:font-mono prose-pre:text-sm prose-pre:overflow-x-auto
                      prose-blockquote:bg-[#1a2a4a] prose-blockquote:text-[#C5A059] prose-blockquote:p-4 prose-blockquote:rounded-2xl prose-blockquote:rounded-tl-none prose-blockquote:border-l-4 prose-blockquote:border-[#C5A059] prose-blockquote:not-italic prose-blockquote:my-6 prose-blockquote:shadow-md prose-blockquote:indent-0
                      prose-em:text-[#4FD1C5] prose-em:not-italic
                    ">
                      <ReactMarkdown
                        components={{
                          strong: ({ node, children, ...props }) => {
                            const content = String(children);
                            if (content.includes('[HỆ THỐNG]')) {
                              return <strong className="text-[#FF4D4D] font-bold" {...props}>{children}</strong>;
                            }
                            return <strong {...props}>{children}</strong>;
                          },
                          em: ({ node, children, ...props }) => {
                            return <em className="text-[#4FD1C5] not-italic font-medium" {...props}>{children}</em>;
                          },
                          blockquote: ({ node, children, ...props }) => {
                            return <blockquote className="text-[#C5A059] border-[#C5A059]" {...props}>{children}</blockquote>;
                          }
                        }}
                      >
                        {textToRender + (isLatestAssistant && isLoading && gameConfig.responseMode === 'streaming' ? ' ▍' : '')}
                      </ReactMarkdown>
                    </div>

                    {worldEvents.length > 0 && (
                      <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 mb-2 px-2">
                           <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent"></div>
                           <Globe className="w-4 h-4 text-[#8B5CF6] opacity-50" />
                           <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent"></div>
                        </div>
                        {worldEvents.map((event, i) => (
                          <div 
                            key={i} 
                            className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 p-6 rounded-2xl relative overflow-hidden group animate-[fadeIn_0.5s_ease-out]"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#8B5CF6]/30"></div>
                            <div className="text-[15px] leading-relaxed text-[#D8B4FE] italic relative z-10">
                              <ReactMarkdown>{event}</ReactMarkdown>
                            </div>
                            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                               <Globe className="w-24 h-24 text-[#8B5CF6]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )})()}
              </div>
            )})}
            {isLoading && (!gameState.messages[gameState.messages.length - 1]?.content) && (
              <div className="flex gap-4 md:gap-6 flex-row">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-[#F27D26]/10 border border-[#F27D26]/30 text-[#F27D26] flex items-center justify-center">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 max-w-[85%] rounded-2xl p-5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-[#F27D26] rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Toggle Input Button */}
        <div className="absolute bottom-4 right-4 z-50 md:bottom-8 md:right-8 flex flex-col gap-3">
          <button 
            onClick={() => setIsInputVisible(!isInputVisible)}
            className="p-3 bg-[#141414] border border-[#333] rounded-full shadow-lg text-[#8E9299] hover:text-white transition-colors"
            title={isInputVisible ? "Ẩn khung nhập" : "Hiện khung nhập"}
          >
            <Terminal className="w-5 h-5" />
          </button>
        </div>

        {/* Input Area */}
        <footer className={cn(
          "bg-[#112240] border-t border-[#1d2d50] z-40 transition-all duration-300 ease-in-out",
          isInputVisible ? "p-4 md:p-6 opacity-100 translate-y-0" : "h-0 p-0 opacity-0 translate-y-full overflow-hidden border-none"
        )}>
          {gameState.messages.length === 1 && gameState.messages[0].id === 'initial' && (
            <div className="max-w-4xl mx-auto mb-4 flex justify-center">
              <button
                onClick={() => setIsCreationOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                AI Tạo Thế Giới & Nhân Vật Nhanh
              </button>
            </div>
          )}
          <ActionInput ref={actionInputRef} onSubmit={handleSubmit} isLoading={isLoading} />
        </footer>
      </div>

      <AudiobookModal isOpen={isAudiobookOpen} onClose={() => setIsAudiobookOpen(false)} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <CreationInterface 
        isOpen={isCreationOpen} 
        onClose={() => setIsCreationOpen(false)} 
        onConfirm={(prompt) => {
          setIsCreationOpen(false);
          handleSubmit(undefined, prompt);
        }} 
      />

      <AnimatePresence>
        {isCodexOpen && (
          <CodexPanel 
            isOpen={isCodexOpen} 
            onClose={() => setIsCodexOpen(false)} 
            onManualSummarize={() => performSummarization()}
            isSummarizing={isSummarizing}
          />
        )}
      </AnimatePresence>

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#333] rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#222]">
              <h2 className="text-lg font-bold text-red-400">Chi tiết lỗi kết nối</h2>
              <button onClick={() => setIsErrorModalOpen(false)} className="p-2 text-[#8E9299] hover:text-white rounded-lg hover:bg-[#141414]">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiStatus.errors.map((err, idx) => (
                <div key={idx} className="bg-[#141414] p-3 rounded-lg border border-[#333]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#F27D26]">{err.method}</span>
                    <span className="text-[10px] text-[#8E9299]">{err.time}</span>
                  </div>
                  <p className="text-sm text-red-300 font-mono break-all">{err.error}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`Method: ${err.method}\nError: ${err.error}`);
                      alert('Đã copy lỗi!');
                    }}
                    className="mt-2 text-xs bg-[#222] hover:bg-[#333] text-white px-2 py-1 rounded transition-colors"
                  >
                    Copy lỗi
                  </button>
                </div>
              ))}
              {aiStatus.errors.length === 0 && (
                <p className="text-sm text-[#8E9299] text-center">Không có lỗi nào được ghi nhận.</p>
              )}
            </div>
            <div className="p-4 border-t border-[#222] flex justify-end">
              <button 
                onClick={() => setAiStatus(prev => ({ ...prev, errors: [] }))}
                className="px-4 py-2 bg-[#141414] hover:bg-[#222] border border-[#333] rounded-lg text-sm text-white transition-colors"
              >
                Xóa lịch sử lỗi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ActionInput = React.forwardRef(({ onSubmit, isLoading }: { 
  onSubmit: (e?: React.FormEvent, content?: string) => void, 
  isLoading: boolean,
}, ref) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => ({
    setInputValue: (val: string) => {
      setValue(val);
    }
  }));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(e, value.trim());
    setValue('');
  };

  // Adjust height when value changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 192) + 'px';
    }
  }, [value]);

  return (
    <div className="max-w-4xl mx-auto relative">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1 bg-[#1d2d50] border border-[#2d3d60] rounded-xl focus-within:border-[#F27D26] focus-within:ring-1 focus-within:ring-[#F27D26] transition-all duration-200">
          <div className="absolute left-4 top-4 text-[#8E9299]">
            <Terminal className="w-5 h-5" />
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Nhập hành động của bạn... (Shift + Enter để xuống dòng)"
            className="w-full bg-transparent text-white placeholder-[#8E9299] p-4 pl-12 pr-4 min-h-[56px] max-h-48 resize-none focus:outline-none text-sm md:text-base"
            rows={1}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="h-[56px] px-6 bg-[#F27D26] hover:bg-[#ff8c3a] text-black font-bold rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      <div className="mt-2 text-center text-[10px] text-[#8E9299] font-mono uppercase tracking-wider">
        AI có thể tạo ra nội dung không chính xác. Vui lòng kiểm tra lại.
      </div>
    </div>
  );
});
