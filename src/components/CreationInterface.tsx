import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { generateWorldAndCharacter } from '../lib/gemini';
import { X, Wand2, Globe2, UserCircle2, Loader2, Play, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming cn utility is there

type CreationInterfaceProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (prompt: string) => void;
}

export default function CreationInterface({ isOpen, onClose, onConfirm }: CreationInterfaceProps) {
  const { aiConfig, gameConfig, setGameConfig } = useGame();
  
  const [activeTab, setActiveTab] = useState<'world' | 'character'>('world');
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ genre: string; style: string } | null>(null);
  
  const [worldData, setWorldData] = useState({
    name: '', description: '', history: '', powerSystem: '', factions: '', locations: '', laws: ''
  });
  
  const [charData, setCharData] = useState({
    name: '', age: '', gender: '', background: '', appearance: '', level: '', stats: '', skills: '', inventory: '', personality: ''
  });

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setAiSuggestions(null);
    try {
      const data = await generateWorldAndCharacter(idea, aiConfig, gameConfig);
      if (data) {
        if (data.suggestions) {
          setAiSuggestions(data.suggestions);
        }
        if (data.world) {
          setWorldData({
            name: data.world.name || '',
            description: data.world.description || '',
            history: data.world.history || '',
            powerSystem: data.world.powerSystem || '',
            factions: Array.isArray(data.world.factions) ? data.world.factions.join('\n') : (data.world.factions || ''),
            locations: Array.isArray(data.world.locations) ? data.world.locations.join('\n') : (data.world.locations || ''),
            laws: Array.isArray(data.world.laws) ? data.world.laws.join('\n') : (data.world.laws || '')
          });
        }
        if (data.character) {
          setCharData({
            name: data.character.name || '',
            age: data.character.age || '',
            gender: data.character.gender || '',
            background: data.character.background || '',
            appearance: data.character.appearance || '',
            level: data.character.level || '',
            stats: data.character.stats || '',
            skills: Array.isArray(data.character.skills) ? data.character.skills.join('\n') : (data.character.skills || ''),
            inventory: Array.isArray(data.character.inventory) ? data.character.inventory.join('\n') : (data.character.inventory || ''),
            personality: data.character.personality || ''
          });
        }
        setActiveTab('world');
      }
    } catch (e) {
      alert("Lỗi khi tạo thế giới và nhân vật. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestions = () => {
    console.log("Applying AI suggestions:", aiSuggestions);
    if (!aiSuggestions) return;

    setGameConfig(prev => ({
      ...prev,
      genre: aiSuggestions.genre,
      style: aiSuggestions.style
    }));
    
    alert(`Hệ thống đã tự động cấu hình:\n- Thể loại: ${aiSuggestions.genre}\n- Văn phong: ${aiSuggestions.style}`);
    setAiSuggestions(null); // Clear suggestions after applying
  };

  const handleStart = () => {
    // Compile into prompt
    const prompt = `Bắt đầu. Tôi muốn khởi tạo trò chơi với bối cảnh và nhân vật sau:

[BỐI CẢNH THẾ GIỚI]
- Tên thế giới: ${worldData.name}
- Mô tả tổng quan: ${worldData.description}
- Lịch sử: ${worldData.history}
- Hệ thống sức mạnh: ${worldData.powerSystem}
- Các thế lực chính:
${worldData.factions}
- Các địa điểm quan trọng:
${worldData.locations}
- Quy tắc/Pháp luật:
${worldData.laws}

[NHÂN VẬT CHÍNH]
- Tên: ${charData.name}
- Tuổi/Giới tính: ${charData.age} / ${charData.gender}
- Xuất thân: ${charData.background}
- Ngoại hình: ${charData.appearance}
- Tính cách: ${charData.personality}
- Cấp độ/Tu vi ban đầu: ${charData.level}
- Thể chất/Tố chất: ${charData.stats}
- Kỹ năng/Công pháp:
${charData.skills}
- Hành trang:
${charData.inventory}

Hãy tường thuật lượt đầu tiên, khắc họa sắc nét cảnh ngay lúc này khi tôi bước vào thế giới. Theo đúng văn phong và phong cách đã chọn. Cập nhật các bảng trạng thái với dữ liệu đầu vào.`;
    onConfirm(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl shadow-2xl">
      <div 
        className="bg-[#0b1021] border-0 sm:border sm:border-[#1e293b]/80 rounded-none sm:rounded-2xl w-full max-w-6xl h-full sm:h-[90vh] flex flex-col shadow-[0_0_100px_rgba(30,58,138,0.4)] overflow-hidden animate-[slamIn_0.4s_cubic-bezier(0.16,1,0.3,1)] relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between p-4 md:p-5 border-b border-[#1e293b] bg-[#050814] relative z-10 shrink-0">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3 text-white uppercase tracking-wider">
            <Globe2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent truncate line-clamp-1">Nexus</span> 
            <span className="hidden sm:inline">: Khởi Tạo Thực Tại</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#1e293b] rounded-lg transition-colors text-gray-400 hover:text-white shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-5 bg-gradient-to-r from-[#0f172a] to-[#0b1021] border-b border-[#1e293b] relative z-10 shrink-0">
          <label className="block text-[10px] md:text-xs font-mono uppercase tracking-widest text-cyan-500/70 mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Lõi Ý Tưởng Hiện tại
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              className="flex-1 bg-[#050814]/70 text-emerald-100 border border-cyan-900/50 rounded-xl p-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-none h-[50px] sm:h-[60px] font-mono text-sm shadow-inner transition-all"
              placeholder="Nhập hạt giống thế giới..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !idea.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:from-[#1e293b] disabled:to-[#0f172a] disabled:text-gray-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:shadow-none border border-cyan-400/20"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {isGenerating ? 'ĐANG K.TẠO' : 'KÍCH HOẠT'}
            </button>
          </div>

          {aiSuggestions && (
            <div className="mt-3 bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-[fadeIn_0.3s_ease-out] shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-[11px] sm:text-xs leading-relaxed">
                  <span className="text-gray-400">AI Nhận diện:</span>{' '}
                  <span className="text-cyan-400 font-bold">{aiSuggestions.genre}</span>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="text-blue-400 font-bold">{aiSuggestions.style}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applySuggestions();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-[11px] font-black rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 shrink-0"
              >
                ÁP DỤNG NGAY
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative z-10">
          <div className="w-full md:w-56 bg-[#050814] border-b md:border-b-0 md:border-r border-[#1e293b] p-2 md:p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('world')}
              className={cn(
                "flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 md:py-4 rounded-xl transition-all text-center md:text-left uppercase text-[11px] md:text-sm font-black tracking-widest border whitespace-nowrap",
                activeTab === 'world' ? "bg-cyan-900/40 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "text-gray-500 border-transparent hover:bg-[#0f172a] hover:text-gray-300"
              )}
            >
              <Globe2 className="w-5 h-5 shrink-0" />
              Thế Giới
            </button>
            <button
              onClick={() => setActiveTab('character')}
              className={cn(
                "flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-3 md:py-4 rounded-xl transition-all text-center md:text-left uppercase text-[11px] md:text-sm font-black tracking-widest border whitespace-nowrap",
                activeTab === 'character' ? "bg-purple-900/40 text-purple-400 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "text-gray-500 border-transparent hover:bg-[#0f172a] hover:text-gray-300"
              )}
            >
              <UserCircle2 className="w-5 h-5 shrink-0" />
              Nhân Vật
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0b1021] custom-scrollbar">
            {activeTab === 'world' ? (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out_forwards]">
                <h3 className="text-xl font-bold text-cyan-500/80 mb-6 border-b border-cyan-900/50 pb-2 flex items-center gap-2">
                   Bản Ghi Thực Tại
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-cyan-600 font-bold z-10 transition-colors group-focus-within:text-cyan-400 truncate max-w-[90%]">Định danh thế giới</label>
                    <input className="w-full bg-[#050814]/80 text-cyan-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner" value={worldData.name} onChange={e => setWorldData({...worldData, name: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-cyan-600 font-bold z-10 transition-colors group-focus-within:text-cyan-400 truncate max-w-[90%] tracking-widest">Cấu trúc tổng quan</label>
                    <textarea className="w-full bg-[#050814]/80 text-cyan-50 p-4 rounded-xl border border-[#1e293b] group-focus-within:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner min-h-[150px] md:min-h-[180px] leading-relaxed" value={worldData.description} onChange={e => setWorldData({...worldData, description: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-cyan-600 font-bold z-10 transition-colors group-focus-within:text-cyan-400 truncate max-w-[90%] tracking-widest">Dòng thời gian (Lịch sử)</label>
                    <textarea className="w-full bg-[#050814]/80 text-cyan-50 p-4 rounded-xl border border-[#1e293b] group-focus-within:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner min-h-[150px] md:min-h-[180px] leading-relaxed" value={worldData.history} onChange={e => setWorldData({...worldData, history: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-cyan-600 font-bold z-10 transition-colors group-focus-within:text-cyan-400 truncate max-w-[90%]">Khung Sức Mạnh</label>
                    <textarea className="w-full bg-[#050814]/80 text-cyan-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner min-h-[80px]" value={worldData.powerSystem} onChange={e => setWorldData({...worldData, powerSystem: e.target.value})} />
                  </div>
                  <div className="relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-cyan-600 font-bold z-10 transition-colors group-focus-within:text-cyan-400 truncate max-w-[90%]">Mạng lưới Thế lực</label>
                    <textarea className="w-full bg-[#050814]/80 text-cyan-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner min-h-[120px]" value={worldData.factions} onChange={e => setWorldData({...worldData, factions: e.target.value})} />
                  </div>
                  <div className="relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-cyan-600 font-bold z-10 transition-colors group-focus-within:text-cyan-400 truncate max-w-[90%]">Các Tọa độ Chính</label>
                    <textarea className="w-full bg-[#050814]/80 text-cyan-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner min-h-[120px]" value={worldData.locations} onChange={e => setWorldData({...worldData, locations: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-cyan-600 font-bold z-10 transition-colors group-focus-within:text-cyan-400 truncate max-w-[90%]">Quy tắc Vận Hành</label>
                    <textarea className="w-full bg-[#050814]/80 text-cyan-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner min-h-[80px]" value={worldData.laws} onChange={e => setWorldData({...worldData, laws: e.target.value})} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out_forwards]">
                <h3 className="text-xl font-bold text-purple-500/80 mb-6 border-b border-purple-900/50 pb-2 flex items-center gap-2">
                   Hồ Sơ Cấu Thể
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Danh xưng</label>
                    <input className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner" value={charData.name} onChange={e => setCharData({...charData, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="relative group flex-1 mt-3 sm:mt-0">
                      <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] sm:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Vòng đời (Tuổi)</label>
                      <input className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner" value={charData.age} onChange={e => setCharData({...charData, age: e.target.value})} />
                    </div>
                    <div className="relative group flex-1 mt-3 sm:mt-0">
                      <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] sm:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Giới tính</label>
                      <input className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner" value={charData.gender} onChange={e => setCharData({...charData, gender: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Hồ sơ Nguồn Gốc (Xuất thân)</label>
                    <input className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner" value={charData.background} onChange={e => setCharData({...charData, background: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%] tracking-widest">Cấu tạo bề mặt (Ngoại hình)</label>
                    <textarea className="w-full bg-[#050814]/80 text-purple-50 p-4 rounded-xl border border-[#1e293b] group-focus-within:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner min-h-[150px] md:min-h-[180px] leading-relaxed" value={charData.appearance} onChange={e => setCharData({...charData, appearance: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2 relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Cốt lõi Thần Hồn (Tính cách)</label>
                    <input className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner" value={charData.personality} onChange={e => setCharData({...charData, personality: e.target.value})} />
                  </div>
                  <div className="relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Cấp bậc</label>
                    <input className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner" value={charData.level} onChange={e => setCharData({...charData, level: e.target.value})} />
                  </div>
                  <div className="relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Tố chất cốt lõi</label>
                    <input className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner" value={charData.stats} onChange={e => setCharData({...charData, stats: e.target.value})} />
                  </div>
                  <div className="relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Kỹ năng / Giao thức</label>
                    <textarea className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner min-h-[100px]" value={charData.skills} onChange={e => setCharData({...charData, skills: e.target.value})} />
                  </div>
                  <div className="relative group mt-3 md:mt-0">
                    <label className="absolute -top-2 left-3 bg-[#0b1021] px-1 text-[10px] md:text-xs font-mono uppercase text-purple-600 font-bold z-10 transition-colors group-focus-within:text-purple-400 truncate max-w-[90%]">Kho lưu trữ (Hành trang)</label>
                    <textarea className="w-full bg-[#050814]/80 text-purple-50 p-3 rounded-lg border border-[#1e293b] group-focus-within:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner min-h-[100px]" value={charData.inventory} onChange={e => setCharData({...charData, inventory: e.target.value})} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[#1e293b] bg-[#050814] flex justify-end gap-4 relative z-10">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold font-mono">
            Đóng
          </button>
          <button 
            onClick={handleStart}
            disabled={!worldData.name || !charData.name}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:grayscale text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all flex items-center gap-3 border border-emerald-400/20"
          >
            <Play className="w-5 h-5 fill-current" />
            Đồng Hóa & Nhập Vai
          </button>
        </div>
      </div>
    </div>
  );
}
