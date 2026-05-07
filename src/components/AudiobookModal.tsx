import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Square, Upload, Download, X, Headphones, Settings2, FileText, Volume2 } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { cn } from '../lib/utils';

// Very short transparent/silent WAV file to keep audio session alive in background
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export default function AudiobookModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { gameState } = useGame();
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'reader' | 'export'>('export');

  // Config reference to avoid stale closures during async playback
  const configRef = useRef({
    rate,
    selectedVoiceURI,
    voices
  });

  useEffect(() => {
    configRef.current = { rate, selectedVoiceURI, voices };
  }, [rate, selectedVoiceURI, voices]);

  // Core state reference for async callbacks
  const stateRef = useRef({
    isPlaying: false,
    isPaused: false,
    chunks: [] as string[],
    currentIndex: 0,
  });

  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Memoized chunks for rendering and clicking
  const displayChunks = useMemo(() => {
    if (!text) return [];
    return text.split(/(?<=[.!?\n])\s+/).filter(c => c.trim().length > 0);
  }, [text]);

  // Load voices securely
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        // Filter Vietnamese voices heavily
        const viVoices = availableVoices.filter(v => 
          v.lang.toLowerCase().includes('vi') || 
          v.name.toLowerCase().includes('vietnamese')
        );
        
        const voicesToUse = viVoices.length > 0 ? viVoices : availableVoices;
        setVoices(voicesToUse);
        setSelectedVoiceURI(voicesToUse[0].voiceURI);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Setup background audio trick and Media Session
  useEffect(() => {
    silentAudioRef.current = new Audio(SILENT_WAV);
    silentAudioRef.current.loop = true;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Story Audiobook',
        artist: 'Grok RPG Engine',
      });
      navigator.mediaSession.setActionHandler('play', handlePlay);
      navigator.mediaSession.setActionHandler('pause', handlePause);
      navigator.mediaSession.setActionHandler('stop', handleStop);
    }

    return () => {
      handleStop();
    };
  }, []);

  const getChunks = (str: string) => {
    // Split text into readable chunks (sentences or paragraphs)
    return str.split(/(?<=[.!?\n])\s+/).filter(c => c.trim().length > 0);
  };

  const speakNextChunk = () => {
    if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
    
    if (stateRef.current.currentIndex >= stateRef.current.chunks.length) {
      handleStop();
      return;
    }

    const chunkText = stateRef.current.chunks[stateRef.current.currentIndex];
    
    // Safety check because sometimes iOS kills WebSpeech randomly
    window.speechSynthesis.cancel(); 

    // Lọc bỏ ký tự trang trí (ví dụ: >, <, *, markdown) để TTS không đọc ra thành chữ
    // Xóa tất cả các dấu: < > * ~ # _ = | ^ \ / [ ] { }
    // Thay thế 2 dấu chấm trở lên (..., ..) thành một dấu phẩy để tạo nhịp thở thay vì đọc "chấm chấm chấm"
    // Xóa 2 dấu gạch ngang trở lên
    let textForTTS = chunkText
      .replace(/[<>*~#_=+|^\\/[\]{}]/g, ' ')
      .replace(/\.{2,}/g, ', ')
      .replace(/[-]{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Nếu chunk chỉ có toàn ký tự trang trí, bỏ qua và đọc chunk kế tiếp
    if (!textForTTS || textForTTS.length === 0 || /^[,.!?;:\s]+$/.test(textForTTS)) {
      stateRef.current.currentIndex++;
      setCurrentHighlightIndex(stateRef.current.currentIndex);
      speakNextChunk();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textForTTS);
    // Garbage Collection protection hack (Critical for Chrome & Safari)
    (window as any)._audiobookUtterance = utterance;

    const { selectedVoiceURI: currentVoiceURI, voices: currentVoices, rate: currentRate } = configRef.current;
    
    if (currentVoiceURI && currentVoices.length > 0) {
      const voice = currentVoices.find(v => v.voiceURI === currentVoiceURI);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = currentRate;
    
    utterance.onend = () => {
      stateRef.current.currentIndex++;
      setCurrentHighlightIndex(stateRef.current.currentIndex);
      
      // Recursively play next chunk without stale closures
      if (stateRef.current.isPlaying && !stateRef.current.isPaused) {
        setTimeout(() => speakNextChunkRef.current?.(), 100);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.error('SpeechSynthesis Error', e);
        stateRef.current.currentIndex++;
        setTimeout(() => speakNextChunkRef.current?.(), 100);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakNextChunkRef = useRef<(() => void) | null>(null);
  speakNextChunkRef.current = speakNextChunk;

  const handlePlay = async () => {
    if (!text.trim()) {
      alert("Chưa có đoạn văn nào để đọc!");
      return;
    }

    // Play silent audio to keep background awake
    try {
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      if (silentAudioRef.current) {
        await silentAudioRef.current.play();
      }
    } catch (e) {
      console.log('Background audio play failed, interaction required');
    }

    if (stateRef.current.isPaused) {
      // Resume from pause
      setIsPaused(false);
      stateRef.current.isPaused = false;
      speakNextChunk();
    } else {
      // Start fresh
      window.speechSynthesis.cancel();
      stateRef.current = {
        isPlaying: true,
        isPaused: false,
        chunks: displayChunks,
        currentIndex: 0
      };
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentHighlightIndex(0);
      speakNextChunk();
    }
  };

  const handleChunkClick = async (index: number) => {
    // Stop current TTS
    window.speechSynthesis.cancel();
    
    // Ensure background audio is playing
    try {
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      if (silentAudioRef.current) await silentAudioRef.current.play();
    } catch (e) {
      console.log('User interaction required for audio');
    }

    stateRef.current = {
      isPlaying: true,
      isPaused: false,
      chunks: displayChunks,
      currentIndex: index
    };
    
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentHighlightIndex(index);
    
    // Give cancel a tiny moment to process then start new chunk
    setTimeout(() => speakNextChunkRef.current?.(), 50);
  };

  const handlePause = () => {
    setIsPaused(true);
    stateRef.current.isPaused = true;
    window.speechSynthesis.cancel(); // Stop current utterance, we will resume from chunk index later
    
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentHighlightIndex(-1);
    stateRef.current.isPlaying = false;
    stateRef.current.isPaused = false;
    stateRef.current.currentIndex = 0;
    
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        handleStop(); // Cleanup before new file
        setText(evt.target.result as string);
        setActiveTab('reader');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    let content = '';
    let chapterCount = 1;
    const assistantMsgs = gameState.messages.filter(m => m.role === 'assistant');
    
    assistantMsgs.forEach((msg) => {
      let t = msg.content;
      
      // Xóa block JSON
      t = t.replace(/===STATE_UPDATE===[\s\S]*?===END_STATE_UPDATE===/g, '');
      
      // Xử lý tiêu đề
      const titleMatch = t.match(/\[TITLE\]([\s\S]*?)\[\/TITLE\]/i) || t.match(/\[TITLE\]([\s\S]*?)$/i);
      if (titleMatch) {
         t = t.replace(titleMatch[0], '').trim();
         content += `\n\n========== CHƯƠNG ${chapterCount}: ${titleMatch[1].trim()} ==========\n\n`;
      } else {
         content += `\n\n========== PHẦN ${chapterCount} ==========\n\n`;
      }
      chapterCount++;
      
      // Lọc bỏ các thông báo hệ thống thừa
      t = t.replace(/\*\*\[HỆ THỐNG\].*?\*\*/g, '');
      
      content += t.trim() + '\n\n';
    });

    if (!content.trim()) {
      alert('Chưa có nội dung truyện để xuất!');
      return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GrokRPG_Book_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#0a0a0a] border border-[#333] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#112240]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#F27D26]" />
            Chế Bản & Sách Nói
          </h2>
          <button onClick={() => { handleStop(); onClose(); }} className="text-[#8E9299] hover:text-white p-1 rounded-lg hover:bg-[#141414]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222]">
          <button 
            onClick={() => setActiveTab('export')}
            className={cn("flex-1 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors", activeTab === 'export' ? "border-[#F27D26] text-[#F27D26]" : "border-transparent text-[#8E9299] hover:text-white")}
          >
            Xuất Truyện
          </button>
          <button 
            onClick={() => setActiveTab('reader')}
            className={cn("flex-1 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors", activeTab === 'reader' ? "border-[#F27D26] text-[#F27D26]" : "border-transparent text-[#8E9299] hover:text-white")}
          >
            Sách Nói
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'export' && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-[#141414] rounded-full border border-[#333] flex items-center justify-center text-[#F27D26]">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Đóng Gói Cuốn Tiểu Thuyết Của Bạn</h3>
                <p className="text-sm text-[#8E9299] max-w-md mx-auto">
                  Chức năng này sẽ tự động thu thập toàn bộ các lượt tường thuật, loại bỏ mã JSON ẩn và chỉ thị hệ thống, sau đó định dạng lại thành một file văn bản trơn (.txt) sạch sẽ để bạn tải về.
                </p>
              </div>
              <button 
                onClick={handleExport}
                className="px-8 py-3 bg-[#F27D26] hover:bg-[#ff8c3a] text-black font-bold rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" /> Tải Xuống File Truyện (TXT)
              </button>
            </div>
          )}

          {activeTab === 'reader' && (
            <div className="space-y-6 flex flex-col h-full">
              {/* Controls */}
              <div className="bg-[#141414] p-4 rounded-xl border border-[#222] space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex-1 w-full relative">
                    <label className="block text-xs text-[#8E9299] font-mono mb-1">Giọng Đọc</label>
                    <div className="relative">
                      <Volume2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F27D26]" />
                      <select 
                        value={selectedVoiceURI} 
                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#333] text-sm text-white rounded-lg py-2 pl-10 pr-4 focus:border-[#F27D26] focus:outline-none appearance-none"
                      >
                        {voices.map((v, index) => (
                          <option key={`${v.voiceURI}-${index}`} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs text-[#8E9299] font-mono mb-1">Tốc độ: {rate.toFixed(1)}x</label>
                    <input 
                      type="range" 
                      min="0.5" max="2" step="0.1" 
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full accent-[#F27D26]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-center pt-2">
                  <label className="cursor-pointer p-2 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#F27D26] text-[#8E9299] hover:text-[#F27D26] transition-colors" title="Tải file TXT">
                    <Upload className="w-5 h-5" />
                    <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                  
                  {!isPlaying || isPaused ? (
                    <button onClick={handlePlay} className="p-4 bg-[#F27D26] hover:bg-[#ff8c3a] text-black rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-[#F27D26]/20">
                      <Play className="w-8 h-8 ml-1" />
                    </button>
                  ) : (
                    <button onClick={handlePause} className="p-4 bg-[#F27D26] hover:bg-[#ff8c3a] text-black rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-[#F27D26]/20">
                      <Pause className="w-8 h-8" />
                    </button>
                  )}

                  <button onClick={handleStop} disabled={!isPlaying && !isPaused} className="p-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-[#8E9299] hover:text-red-400 hover:border-red-400 transition-colors disabled:opacity-50" title="Dừng">
                    <Square className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-center text-[10px] text-[#8E9299] flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Hỗ trợ nghe khi tắt màn hình điện thoại (Background Playback)
                </div>
              </div>

              {/* Text Reader */}
              <div className="flex-1 bg-[#141414] p-4 rounded-xl border border-[#222] min-h-[300px] overflow-y-auto">
                {!text ? (
                  <div className="h-full flex items-center justify-center text-[#8E9299] text-sm text-center">
                    Hãy bấm nút Tải Lên (Lọc thẻ) để tải file TXT mà bạn vừa xuất vào đây.
                  </div>
                ) : (
                  <div className="text-[#D1D1D1] leading-relaxed text-sm whitespace-pre-wrap font-sans">
                    {displayChunks.length > 0 ? (
                      displayChunks.map((chunk, index) => (
                        <span 
                          key={index}
                          onClick={() => handleChunkClick(index)}
                          className={cn(
                            "transition-colors duration-300 cursor-pointer rounded map-span inline-block mb-1 hover:bg-[#F27D26]/40",
                            currentHighlightIndex === index ? "bg-[#F27D26]/20 text-white font-medium shadow-sm shadow-[#F27D26]/10" : ""
                          )}
                        >
                          {chunk}
                        </span>
                      ))
                    ) : (
                       text
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
