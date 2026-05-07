import React, { useState } from 'react';
import { useGame, EntityMemoryState } from '../contexts/GameContext';
import { cn } from '../lib/utils';
import { Users, Globe, X, Heart, Shield, Zap, TrendingUp, Info, History, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CodexPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onManualSummarize?: () => void;
  isSummarizing?: boolean;
}

export default function CodexPanel({ isOpen, onClose, onManualSummarize, isSummarizing }: CodexPanelProps) {
  const { gameState } = useGame();
  const [activeTab, setActiveTab] = useState<'npcs' | 'world' | 'memory'>('npcs');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl h-full bg-[#0a192f] border-l border-[#1d2d50] shadow-2xl flex flex-col relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1d2d50] flex items-center justify-between bg-[#112240]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('npcs')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all",
                activeTab === 'npcs' ? "bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "text-[#8E9299] hover:text-white"
              )}
            >
              <Users className="w-4 h-4" /> Nhân Vật
            </button>
            <button 
              onClick={() => setActiveTab('world')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all",
                activeTab === 'world' ? "bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "text-[#8E9299] hover:text-white"
              )}
            >
              <Globe className="w-4 h-4" /> Thế Giới
            </button>
            <button 
              onClick={() => setActiveTab('memory')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all",
                activeTab === 'memory' ? "bg-[#F27D26] text-black shadow-[0_0_15px_rgba(242,125,38,0.3)]" : "text-[#8E9299] hover:text-white"
              )}
            >
              <History className="w-4 h-4" /> Ký Ức Nén
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-[#8E9299] hover:text-white bg-[#141414] rounded-lg border border-[#333]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'npcs' ? (
              <motion.div 
                key="npcs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {(!gameState.entity_memory || gameState.entity_memory.length === 0) ? (
                  <div className="text-center py-20 text-[#8E9299] italic">
                    Chưa có thông tin nhân vật nào được ghi nhận.
                  </div>
                ) : (
                  gameState.entity_memory.map((npc, idx) => (
                    npc && npc.name ? <NPCCard key={npc.name + idx} npc={npc} /> : null
                  ))
                )}
              </motion.div>
            ) : activeTab === 'memory' ? (
              <motion.div 
                key="memory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-gradient-to-br from-[#112240] to-[#0d1b35] border border-cyan-500/30 rounded-2xl shadow-xl">
                  <h3 className="text-cyan-400 font-black uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-cyan-400" /> Hệ Thống Ký Ức Nén
                  </h3>
                  <p className="text-[10px] text-[#8E9299] leading-relaxed mb-6 italic">
                    "Ký ức nén giúp AI duy trì sự tỉnh táo và chính xác trong các cốt truyện dài. Cứ mỗi 15 lượt (30 tin nhắn), các diễn biến cũ sẽ được đúc kết lại để giải phóng không gian tư duy cho AI."
                  </p>

                  <div className="flex justify-between items-center mb-6">
                    <div className="text-[10px] text-cyan-400 font-mono">
                      {gameState.messages.length} tin nhắn / {gameState.summaries?.length || 0} bản nén
                    </div>
                    <button 
                      onClick={onManualSummarize}
                      disabled={isSummarizing || gameState.messages.length < 5}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                        isSummarizing 
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500 cursor-wait"
                          : "bg-cyan-500 text-black border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      )}
                    >
                      {isSummarizing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Đang đóng gói...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3" /> Nén ký ức ngay
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(!gameState.summaries || gameState.summaries.length === 0) ? (
                      <div className="text-center py-10 text-[#8E9299] text-xs">
                        Chưa có bản nén ký ức nào. Hệ thống sẽ tự động tạo mốc đầu tiên khi lịch sử đạt 30 tin nhắn.
                      </div>
                    ) : (
                      gameState.summaries.map((summary, idx) => (
                        <div key={idx} className="group relative">
                          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-cyan-500/20 group-hover:bg-cyan-500/50 transition-colors rounded-full" />
                          <div className="bg-black/30 border border-white/5 rounded-xl p-4 transition-all hover:border-cyan-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded border border-cyan-500/20 uppercase tracking-widest">Mốc {idx + 1}</span>
                              <div className="h-px flex-1 bg-white/5" />
                            </div>
                            <p className="text-xs leading-relaxed text-[#D1D1D1] indent-4 whitespace-pre-wrap">
                              {summary}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="world"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Time & World Pulse */}
                <div className="p-4 bg-gradient-to-br from-[#112240] to-[#0d1b35] border border-[#F27D26]/30 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#F27D26] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <Globe className="w-5 h-5" /> Thế Giới Hiện Tại
                    </h3>
                    <div className="px-3 py-1 bg-black/40 rounded-full border border-white/5 text-[10px] font-mono text-[#8E9299]">
                      {gameState.world_time || 'Chưa rõ'}
                    </div>
                  </div>

                  {/* Faction Dynamics */}
                  {gameState.factions_dynamics && Array.isArray(gameState.factions_dynamics) && gameState.factions_dynamics.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {gameState.factions_dynamics.map((faction, i) => (
                        faction && (
                          <div key={i} className="p-3 bg-black/20 rounded-xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white uppercase">{faction.name}</span>
                              <span className={cn(
                                "text-[10px] font-black",
                                faction.trend === 'up' ? "text-green-500" : faction.trend === 'down' ? "text-red-500" : "text-gray-500"
                              )}>
                                {faction.trend === 'up' ? '▲' : faction.trend === 'down' ? '▼' : '━'}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-[#F27D26]" style={{ width: `${faction.power || 0}%` }}></div>
                            </div>
                            <p className="text-[9px] text-[#8E9299] italic leading-tight">{faction.status}</p>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  <h4 className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Nhịp Đập Thế Giới
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
                    {(!gameState.world_events || gameState.world_events.length === 0) ? (
                      <p className="text-[#8E9299] text-[11px] italic">Thế giới đang yên bình...</p>
                    ) : (
                      gameState.world_events.map((event, i) => {
                        const eventText = typeof event === 'string' ? event : (event && typeof event === 'object' ? ((event as any).description || (event as any).name || JSON.stringify(event)) : String(event));
                        return (
                        <div key={i} className="p-3 bg-black/20 border border-white/5 rounded-lg flex gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#F27D26] shrink-0"></div>
                          <p className="text-[11px] leading-relaxed text-[#D1D1D1]">{eventText}</p>
                        </div>
                      )})
                    )}
                  </div>
                </div>

                {/* Locations & Factions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest border-b border-[#333] pb-2">Địa Danh & Thế Lực</h3>
                    {gameState.lore_book && Array.isArray(gameState.lore_book.factions_locations) && gameState.lore_book.factions_locations.map((item, i) => {
                      const itemText = typeof item === 'string' ? item : (item && typeof item === 'object' ? ((item as any).description || (item as any).name || JSON.stringify(item)) : String(item));
                      return (
                      <div key={i} className="text-xs text-[#8E9299] p-3 bg-[#112240]/50 rounded-lg border border-white/5">
                        {itemText}
                      </div>
                    )})}
                    {(!gameState.lore_book || !gameState.lore_book.factions_locations || gameState.lore_book.factions_locations.length === 0) && (
                       <p className="text-[10px] text-[#8E9299] italic">Chưa có thông tin.</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest border-b border-[#333] pb-2">Quy Tắc Thế Giới</h3>
                    {gameState.lore_book && Array.isArray(gameState.lore_book.world_rules) && gameState.lore_book.world_rules.map((item, i) => {
                      const itemText = typeof item === 'string' ? item : (item && typeof item === 'object' ? ((item as any).description || (item as any).name || JSON.stringify(item)) : String(item));
                      return (
                      <div key={i} className="text-xs text-[#8E9299] p-3 bg-[#112240]/50 rounded-lg border border-white/5 italic">
                        {itemText}
                      </div>
                    )})}
                    {(!gameState.lore_book || !gameState.lore_book.world_rules || gameState.lore_book.world_rules.length === 0) && (
                       <p className="text-[10px] text-[#8E9299] italic">Chưa có thông tin.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function NPCCard({ npc }: { npc: EntityMemoryState }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#112240] border border-[#1d2d50] rounded-2xl overflow-hidden group hover:border-[#F27D26]/50 transition-all duration-300 shadow-lg">
      <div className="p-5 flex flex-col md:flex-row gap-5">
        {/* Basic Info */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                {npc.name} 
                {npc.isDead && <span className="text-[10px] bg-red-900/50 text-red-500 px-2 py-0.5 rounded uppercase">Đã chết</span>}
              </h4>
              <p className="text-xs text-[#F27D26] font-mono">{npc.cultivation || 'Phàm nhân'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest">{npc.age || '??'} Tuổi</span>
            </div>
          </div>

          {/* Relationship Gauges (Suggestion 2) */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <Gauge label="Tin Tưởng" value={npc.loyalty || 50} color="from-blue-500 to-indigo-500" icon={<Shield className="w-3 h-3" />} />
            <Gauge label="Hảo Cảm" value={npc.affection || 20} color="from-pink-500 to-rose-500" icon={<Heart className="w-3 h-3" />} />
            <Gauge label="Dục Vọng" value={npc.desire || 0} color="from-purple-500 to-fuchsia-600" icon={<Zap className="w-3 h-3" />} />
          </div>

          <p className="text-xs text-[#8E9299] leading-relaxed line-clamp-2 italic">"{npc.personality}"</p>
        </div>

        {/* Action button */}
        <div className="flex items-end">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-[#141414] border border-[#333] text-xs font-bold hover:bg-[#222] transition-colors flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4" /> Chi Tiết
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 border-t border-[#1d2d50] bg-[#0d1b35]"
          >
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem label="Mục Tiêu" value={npc.goal || 'Không rõ'} />
                <DetailItem label="Ký Ức" value={npc.memory} highlight />
                <DetailItem label="Số Đo" value={npc.measurements || 'Chưa rõ'} />
              </div>
              <div className="space-y-4">
                <DetailItem label="Lịch Sử Sex" value={npc.sexual_history || 'Chưa rõ'} />
                <DetailItem label="Kỹ Năng" value={npc.skills || 'Không'} />
                <div className="space-y-2">
                  <span className="text-[10px] text-[#8E9299] uppercase font-bold tracking-[0.2em]">Hình Thể</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(npc.physical_details || {}).map(([key, val]) => (
                      <div key={key} className="p-2 bg-black/30 rounded text-[10px] border border-white/5">
                        <span className="text-white/50">{key}:</span> <span className="text-[#D1D1D1]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Gauge({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-[#8E9299]">
          {icon} {label}
        </span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#141414] rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }} 
          className={cn("h-full bg-gradient-to-r", color)}
        />
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] text-[#8E9299] uppercase font-bold tracking-[0.2em]">{label}</span>
      <p className={cn(
        "text-xs leading-relaxed",
        highlight ? "text-[#C5A059] italic" : "text-[#D1D1D1]"
      )}>{value}</p>
    </div>
  );
}
