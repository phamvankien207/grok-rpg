import React, { useState, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { cn, sanitizeKey } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Save, Upload, RotateCcw, Check, Key, Link2, Sliders, BookOpen, Users, History, Skull, Trash2, Map, Shield, Zap, Gavel, Pin, PinOff, Crown, Sword, Package, FlaskConical, Boxes, Coins, Heart, Brain, Sparkles, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';

const InventoryTabs = ({ inventory }: { inventory: any }) => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'items' | 'materials'>('items');
  
  const tabs = [
    { id: 'equipment', label: 'Trang bị', icon: <Sword className="w-3 h-3" /> },
    { id: 'items', label: 'Vật phẩm', icon: <FlaskConical className="w-3 h-3" /> },
    { id: 'materials', label: 'Nguyên liệu', icon: <Boxes className="w-3 h-3" /> },
  ] as const;

  const content = (inventory && inventory[activeTab]) || 'Trống';
  const items = typeof content === 'string' 
    ? content.split(/[,;|\n]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0 && s.toLowerCase() !== 'trống' && s.toLowerCase() !== 'không')
    : [];

  return (
    <div className="bg-[#141414] rounded-lg overflow-hidden border border-[#222]">
      <div className="flex bg-[#0a192f] border-b border-[#222]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2 px-1 flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold transition-all",
              activeTab === tab.id 
                ? "bg-[#F27D26]/10 text-[#F27D26] border-b-2 border-[#F27D26]" 
                : "text-[#8E9299] hover:bg-white/5"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-3 min-h-[100px]">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#D1D1D1] bg-white/5 p-2 rounded border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-6 text-[#444]">
            <Package className="w-8 h-8 mb-2 opacity-20" />
            <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 italic">Hành trang trống</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const GENRE_GROUPS = [
  {
    category: "Tu Tiên & Võ Hiệp",
    icon: "Sword",
    genres: [
      { name: "Tiên Hiệp", desc: "Tu luyện trường sinh, pháp bảo, tông môn.", examples: "Phàm Nhân Tu Tiên, Tru Tiên" },
      { name: "Kiếm Hiệp", desc: "Giang hồ, nghĩa hiệp, võ công cổ điển.", examples: "Anh Hùng Xạ Điêu, Tiếu Ngạo Giang Hồ" },
      { name: "Huyền Huyễn", desc: "Thế giới giả tưởng huyền bí, thăng cấp thần thánh.", examples: "Đấu Phá Thương Khung, Đấu La Đại Lục" },
      { name: "Đông Phương", desc: "Bối cảnh phương Đông cổ đại, thần thoại.", examples: "Sơn Hải Kinh" }
    ]
  },
  {
    category: "Hiện Đại & Thực Tế",
    icon: "Building",
    genres: [
      { name: "Đô Thị", desc: "Cuộc sống thành thị hiện đại, dị năng hoặc hào môn.", examples: "Cao Thủ Cận Vệ, Thiếu Gia Bị Bỏ Rơi" },
      { name: "Quan Trường", desc: "Đấu đá chính trị, quyền lực nhà nước.", examples: "Sát Thủ Quan Trường" },
      { name: "Trình Thám", desc: "Phá án, suy luận, tội phạm học.", examples: "Sherlock Holmes" },
      { name: "Lịch Sử", desc: "Xuyên không hoặc bối cảnh lịch sử có thật.", examples: "Quốc Sắc Sinh Hương" }
    ]
  },
  {
    category: "Giả Tưởng & Kỳ Ảo",
    icon: "Sparkles",
    genres: [
      { name: "Dị Giới", desc: "Thế giới phép thuật, chủng tộc khác (Elf, Orc).", examples: "Thất Hình Đại Tội, One Piece" },
      { name: "Khoa Huyễn", desc: "Công nghệ tương lai, vũ trụ, robot.", examples: "Tam Thể, Thôn Phệ Tinh Không" },
      { name: "Mạt Thế", desc: "Tận thế, Zombie, sinh tồn tàn khốc.", examples: "Toàn Cầu Băng Phong" },
      { name: "Võng Du", desc: "Thế giới trong game thực tế ảo, thuộc tính nhân vật.", examples: "Toàn Chức Cao Thủ" }
    ]
  },
  {
    category: "Tình Cảm & Ngôn Tình",
    icon: "Heart",
    genres: [
      { name: "Ngôn Tình", desc: "Chuyện tình nam nữ lãng mạn.", examples: "Bên Nhau Trọn Đời" },
      { name: "Đam Mỹ", desc: "Tình cảm nam - nam.", examples: "Ma Đạo Tổ Sư" },
      { name: "Bách Hợp", desc: "Tình cảm nữ - nữ.", examples: "Cung Lâu Diễn Nghĩa" },
      { name: "Cung Đấu", desc: "Đấu đá hậu cung tàn khốc.", examples: "Chân Hoàn Truyện" }
    ]
  },
  {
    category: "Phong Cách Đặc Biệt",
    icon: "Wand2",
    genres: [
      { name: "Hệ Thống", desc: "Nhân vật có hệ thống hỗ trợ vô sỉ.", examples: "Vạn Tộc Chi Kiếp" },
      { name: "Linh Dị", desc: "Ma quái, trừ tà, không khí u ám.", examples: "Đạo Môn Lão Ngũ" },
      { name: "Xuyên Không", desc: "Trở về quá khứ hoặc sang thế giới khác.", examples: "Bộ Bộ Kinh Tâm" },
      { name: "Light Novel", desc: "Phong cách anime/manga Nhật Bản.", examples: "Overlord, Re:Zero" }
    ]
  }
];

const GENRES = GENRE_GROUPS.flatMap(g => g.genres.map(genre => genre.name));

const GENRE_AUTHORS: Record<string, { name: string; desc: string }[]> = {
  "Tiên Hiệp": [
    { name: "Vong Ngữ", desc: "Phàm nhân tu tiên - Thực tế, cẩn trọng" },
    { name: "Nhĩ Căn", desc: "Tiên nghịch - Bi tráng, nghịch thiên" },
    { name: "Ngã Ăn Tây Hồng Thị", desc: "Thôn phệ tinh không - Hoành tráng, logic" },
    { name: "Tiêu Đỉnh", desc: "Tru tiên - Văn phong tình cảm, mượt mà" },
    { name: "Phong Hỏa Hí Chư Hầu", desc: "Kiếm lai - Sâu sắc, triết lý" }
  ],
  "Kiếm Hiệp": [
    { name: "Kim Dung", desc: "Chính tông, hào hiệp, bối cảnh lịch sử đồ sộ" },
    { name: "Cổ Long", desc: "Lãng tử, triết lý, phá cách, nhịp ngắt câu độc đáo" },
    { name: "Ôn Thụy An", desc: "Tứ đại danh bổ - Kỳ ảo, quỷ quyệt, hoa mỹ" }
  ],
  "Huyền Huyễn": [
    { name: "Thần Đông", desc: "Già thiên - Hoành tráng, nhiệt huyết, bí ẩn" },
    { name: "Đường Gia Tam Thiếu", desc: "Đấu la đại lục - Hấp dẫn, sáng tạo hệ thống" },
    { name: "Thiên Tàm Thổ Đậu", desc: "Đấu phá thương khung - Vả mặt, thăng cấp kịch tính" },
    { name: "Mực Thích Lặn Nước", desc: "Quỷ bí chi chủ - Logic, thế giới đồ sộ" }
  ],
  "Đô Thị": [
    { name: "Lão Ưng Cật Tiểu Kê", desc: "Vạn tộc chi kiếp - Nhiệt huyết, vô sỉ, nhịp cực nhanh" },
    { name: "Ngư Nhân Nhị Đại", desc: "Cao thủ cận vệ - Nhẹ nhàng, hài hước, sảng văn" },
    { name: "Thắng Kỷ", desc: "Hào môn - Quyền lực, mưu kế, sắc bén" }
  ],
  "Ngôn Tình": [
    { name: "Cố Mạn", desc: "Nhẹ nhàng, ấm áp, sủng ngọt" },
    { name: "Diệp Lạc Vô Tâm", desc: "Lãng mạn, sâu sắc, có yếu tố cực nóng" },
    { name: "Đinh Mặc", desc: "Trinh thám ngôn tình - Ly kỳ, kịch tính" },
    { name: "Phi Ngã Tư Tồn", desc: "Ngược luyến tàn tâm - Bi kịch, thấm thía" }
  ],
  "Đam Mỹ": [
    { name: "Mặc Hương Đồng Khứu", desc: "Ma đạo tổ sư - Bi tráng, nhân vật ấn tượng" },
    { name: "Priest", desc: "Sát phá lang - Cốt truyện đồ sộ, logic cao" },
    { name: "Tấn Giang", desc: "Văn phong tinh tế, đa dạng" }
  ],
  "Bách Hợp": [
    { name: "Tấn Giang", desc: "Văn phong tinh tế, đa dạng" },
    { name: "Quân Sư", desc: "Nhẹ nhàng, sâu sắc" }
  ],
  "Khoa Huyễn": [
    { name: "Lưu Từ Hân", desc: "Tam thể - Vĩ mô, triết lý, khoa học cứng" },
    { name: "Huyết Hồng", desc: "Mạnh mẽ, tàn khốc, tưởng tượng phong phú" }
  ],
  "Hệ Thống": [
    { name: "Lão Ưng Cật Tiểu Kê", desc: "Hệ thống vô sỉ, tăng cấp điên cuồng" },
    { name: "Quái Đản Mục Ngư", desc: "Hệ thống vả mặt, sảng văn hài hước" }
  ],
  "Linh Dị": [
    { name: "Thanh Khâu", desc: "Bí ẩn, kinh dị, không khí u ám" },
    { name: "Đạo Môn Lão Ngũ", desc: "Tâm linh, trừ tà, thực tế đạo môn" }
  ],
  "Mạt Thế": [
    { name: "Thần Đông", desc: "Bối cảnh tận thế hoành tráng" },
    { name: "Thố Tử Đuôi Ngắn", desc: "Sinh tồn kịch tính, chân thực" }
  ],
  "Võng Du": [
    { name: "Điệp Chi Linh", desc: "Esports, kỹ năng, thi đấu tổ đội" },
    { name: "Mãnh Đội", desc: "Hài hước, sảng văn võng du" }
  ],
  "Lịch Sử": [
    { name: "Nguyệt Quan", desc: "Kiến thức lịch sử sâu, chính kịch" },
    { name: "Thắng Kỷ", desc: "Thay đổi lịch sử, quyền mưu" }
  ],
  "Sắc": [
    { name: "Lam Sắc Sư Tử", desc: "Quyến rũ, miêu tả tinh tế" },
    { name: "Tiểu Long Nữ", desc: "Tình cảm nóng bỏng, táo bạo" },
    { name: "Ẩn danh", desc: "Trực diện, kích thích" }
  ],
  "Trinh Thám": [
    { name: "Đinh Mặc", desc: "Tâm lý tội phạm, suy luận sắc bén" },
    { name: "Lôi Mễ", desc: "Ám ảnh, chân thực, tội phạm học" }
  ],
  "Quan Trường": [
    { name: "Thắng Kỷ", desc: "Quyền lực, mưu kế, sắc bén" },
    { name: "Lão Ngũ", desc: "Gay cấn, chính trị" }
  ],
  "Cung Đấu": [
    { name: "Lưu Liễm Tử", desc: "Hậu cung Chân Hoàn Truyện - Sâu sắc, tàn khốc" },
    { name: "Phỉ Ngã Tư Tồn", desc: "Yêu hận đan xen, bi kịch" }
  ]
};

const DEFAULT_AUTHORS = [
  { name: "Đời thường", desc: "Hài hước, gần gũi, đời sống" },
  { name: "Trực diện", desc: "Ngôn ngữ thô ráp, hành động mạnh" },
  { name: "Văn chương", desc: "Câu chữ hoa mỹ, giàu cảm xúc" }
];

const ProxyPanel = ({
  title,
  proxy,
  onChange
}: {
  title: string;
  proxy: any;
  onChange: (p: any) => void;
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTest = async () => {
    if (!proxy.url) return;
    setIsTesting(true);
    setStatus('idle');
    try {
      await fetch(proxy.url, { method: 'HEAD', mode: 'no-cors' });
      setStatus('success');
      alert('Kết nối Proxy thành công!');
    } catch {
      setStatus('error');
      alert('Kết nối Proxy thất bại. Vui lòng kiểm tra lại URL.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleLoadModels = async () => {
    if (!proxy.url) {
      alert("Vui lòng nhập Proxy URL.");
      return;
    }
    setIsLoadingModels(true);
    try {
      const baseUrl = proxy.url.replace(/\/chat\/completions$/, '').replace(/\/v1$/, '');
      const modelsUrl = `${baseUrl}/v1/models`;

      const response = await fetch(modelsUrl, {
        headers: {
          'Authorization': `Bearer ${proxy.key}`
        }
      });
      if (!response.ok) throw new Error('Không thể tải model');
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id);
        onChange({ ...proxy, availableModels: models, model: proxy.model || models[0] });
        alert(`Tải thành công ${models.length} models!`);
      } else {
        throw new Error('Định dạng trả về không hợp lệ');
      }
    } catch (error) {
      console.error(error);
      alert('Không thể tải danh sách model. Thử thêm /v1/models vào proxy URL của bạn.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(proxy, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxy_config_${proxy.name || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onChange({ ...proxy, ...data });
          alert('Tải cấu hình proxy thành công!');
        } catch {
          alert('Lỗi định dạng cấu hình proxy.');
        }
        if (fileRef.current) fileRef.current.value = '';
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-3 bg-[#1a1f2e] p-4 rounded-xl border border-[#1d2d50]">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[#F27D26] uppercase tracking-wider">{title}</label>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="text-xs text-[#8E9299] hover:text-white">Nhập</button>
          <button onClick={handleExport} className="text-xs text-[#8E9299] hover:text-white">Xuất</button>
          <input type="file" accept=".json" ref={fileRef} onChange={handleImport} className="hidden" />
        </div>
      </div>
      <input
        type="text"
        placeholder="Tên lưu proxy..."
        value={proxy.name}
        onChange={e => onChange({ ...proxy, name: e.target.value })}
        className="w-full bg-[#141414] border border-[#333] rounded-lg p-2.5 text-white text-xs focus:border-[#F27D26] focus:outline-none"
      />
      <input
        type="text"
        placeholder="URL Proxy (VD: https://proxy.example.com/v1)"
        value={proxy.url}
        onChange={e => onChange({ ...proxy, url: e.target.value })}
        className="w-full bg-[#141414] border border-[#333] rounded-lg p-2.5 text-white text-xs focus:border-[#F27D26] focus:outline-none"
      />
      <input
        type="password"
        placeholder="Proxy Password / API Key"
        value={proxy.key}
        onChange={e => onChange({ ...proxy, key: e.target.value })}
        className="w-full bg-[#141414] border border-[#333] rounded-lg p-2.5 text-white text-xs focus:border-[#F27D26] focus:outline-none"
      />
      <div className="flex gap-2">
        <button 
          onClick={handleTest}
          disabled={isTesting}
          className={`flex-1 py-2 border rounded-lg text-xs font-medium transition-colors ${
            isTesting ? 'bg-[#222] text-[#8E9299] border-[#333]' : 
            status === 'success' ? 'bg-green-900/20 text-green-400 border-green-900/50' :
            status === 'error' ? 'bg-red-900/20 text-red-400 border-red-900/50' :
            'bg-[#141414] hover:bg-[#222] border-[#333] text-white'
          }`}
        >
          {isTesting ? 'Đang test...' : 'Connect'}
        </button>
        <button 
          onClick={handleLoadModels}
          disabled={isLoadingModels || !proxy.url}
          className="flex-1 py-2 bg-[#F27D26]/20 border border-[#F27D26]/50 text-[#F27D26] rounded-lg text-xs font-medium hover:bg-[#F27D26]/30 transition-colors disabled:opacity-50"
        >
          {isLoadingModels ? 'Đang tải...' : 'Load Models'}
        </button>
      </div>
      {proxy.availableModels && proxy.availableModels.length > 0 && (
        <select
          value={proxy.model}
          onChange={e => onChange({ ...proxy, model: e.target.value })}
          className="w-full bg-[#141414] border border-[#333] rounded-lg p-2.5 text-white text-xs focus:border-[#F27D26] focus:outline-none"
        >
          <option value="">Chọn Model Proxy...</option>
          {proxy.availableModels.map((m: string) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default function SettingsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { gameState, gameConfig, setGameConfig, aiConfig, setAiConfig, resetGame, setGameState } = useGame();
  const [activeTab, setActiveTab] = useState<'ai' | 'game' | 'character' | 'relationships' | 'lsr' | 'codex'>('ai');
  const [codexSubTab, setCodexSubTab] = useState<'npcs' | 'factions' | 'locations' | 'power' | 'laws'>('npcs');
  const [expandedNpcs, setExpandedNpcs] = useState<Set<number>>(new Set());
  const [newApiKey, setNewApiKey] = useState('');
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !gameState) return null;

  const handleAddApiKey = () => {
    if (newApiKey.trim()) {
      const keys = newApiKey.split(/[\n,]+/).map(k => sanitizeKey(k)).filter(k => k.length > 0);
      setAiConfig(prev => ({ ...prev, apiKeys: [...new Set([...prev.apiKeys, ...keys])] }));
      setNewApiKey('');
    }
  };

  const handleLoadApiKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const keys = text.split(/[\n,]+/).map(k => sanitizeKey(k)).filter(k => k.length > 0);
        setAiConfig(prev => ({ ...prev, apiKeys: [...new Set([...prev.apiKeys, ...keys])] }));
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
      };
      reader.readAsText(file);
    }
  };

  const handleSaveGame = () => {
    const data = JSON.stringify({ gameState, gameConfig, aiConfig });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grok-rpg-save-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadGame = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.gameState) setGameState(data.gameState);
          if (data.gameConfig) setGameConfig(data.gameConfig);
          if (data.aiConfig) setAiConfig(data.aiConfig);
          alert('Tải file save thành công!');
        } catch (error) {
          alert('File save không hợp lệ.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-[#112240] border-l border-[#1d2d50] shadow-2xl flex flex-col animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1d2d50]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#F27D26]" /> Cài đặt Hệ thống
          </h2>
          <button onClick={onClose} className="p-2 text-[#8E9299] hover:text-white rounded-lg hover:bg-[#1d2d50]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-[#1d2d50] hide-scrollbar">
          {[
            { id: 'ai', label: 'AI & Proxy', icon: <Key className="w-4 h-4" /> },
            { id: 'game', label: 'Game', icon: <Sliders className="w-4 h-4" /> },
            { id: 'character', label: 'Nhân vật', icon: <UserIcon className="w-4 h-4" /> },
            { id: 'relationships', label: 'Quan hệ', icon: <Users className="w-4 h-4" /> },
            { id: 'codex', label: 'Sổ tay', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'lsr', label: 'Lịch sử', icon: <History className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-[#F27D26] text-[#F27D26]' : 'border-transparent text-[#8E9299] hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <ProxyPanel
                title="Proxy 1 (Phân tích & Tường thuật)"
                proxy={aiConfig.proxy1 || { name: '', url: '', key: '', model: '', availableModels: [] }}
                onChange={p => setAiConfig({ ...aiConfig, proxy1: p })}
              />
              <ProxyPanel
                title="Proxy 2 (Kiểm tra & Cập nhật ngầm)"
                proxy={aiConfig.proxy2 || { name: '', url: '', key: '', model: '', availableModels: [] }}
                onChange={p => setAiConfig({ ...aiConfig, proxy2: p })}
              />

              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white uppercase tracking-wider">AI Studio API Keys ({aiConfig.apiKeys.length})</label>
                  <button onClick={() => fileInputRef.current?.click()} className="text-xs text-[#F27D26] hover:underline">
                    Tải từ .txt
                  </button>
                  <input type="file" accept=".txt" ref={fileInputRef} onChange={handleLoadApiKeys} className="hidden" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập API Key mới..."
                    value={newApiKey}
                    onChange={e => setNewApiKey(sanitizeKey(e.target.value))}
                    className={cn(
                      "flex-1 bg-[#141414] border rounded-lg p-3 text-white text-sm focus:outline-none",
                      newApiKey && /[^\x00-\xFF]/.test(sanitizeKey(newApiKey))
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#333] focus:border-[#F27D26]"
                    )}
                  />
                  <button onClick={handleAddApiKey} className="px-4 bg-[#F27D26] text-black rounded-lg font-bold hover:bg-[#ff8c3a]">
                    Thêm
                  </button>
                </div>
                {newApiKey && /[^\x00-\xFF]/.test(sanitizeKey(newApiKey)) && (
                  <p className="text-[10px] text-red-500 mt-1">Lỗi: API Key không được chứa dấu tiếng Việt hoặc ký tự đặc biệt lạ.</p>
                )}
                {aiConfig.apiKeys.length > 0 && (
                  <div className="bg-[#141414] border border-[#333] rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                    {aiConfig.apiKeys.map((key, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-[#8E9299] p-1.5 hover:bg-[#222] rounded">
                        <span className="truncate pr-2">...{key.slice(-8)}</span>
                        <button onClick={() => setAiConfig(prev => ({ ...prev, apiKeys: prev.apiKeys.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-300">Xóa</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-white uppercase tracking-wider flex justify-between">
                  <span>Độ dài tường thuật</span>
                  <span className="text-[#F27D26]">{gameConfig.wordCount} từ</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  value={gameConfig.wordCount}
                  onChange={e => setGameConfig({ ...gameConfig, wordCount: parseInt(e.target.value) })}
                  className="w-full accent-[#F27D26]"
                />
              </div>
            </div>
          )}

          {activeTab === 'game' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-3">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Model AI</label>
                <select
                  value={gameConfig.model}
                  onChange={e => setGameConfig({ ...gameConfig, model: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#F27D26] focus:outline-none"
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast & Stable)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex)</option>
                  <option value="gemini-flash-latest">Gemini Flash Latest (Experimental/Reliable)</option>
                  <option value="gemini-2.0-flash-thinking-exp-01-21">Gemini 2.0 Flash Thinking (Reasoning/Slow)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Chế độ xuất văn bản</label>
                <div className="flex bg-[#141414] border border-[#333] rounded-lg overflow-hidden p-1">
                  <button
                    onClick={() => setGameConfig({ ...gameConfig, responseMode: 'streaming' })}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors",
                      gameConfig.responseMode === 'streaming' ? "bg-[#F27D26] text-black" : "text-[#8E9299] hover:text-white"
                    )}
                  >
                    Streaming (Thời gian thực)
                  </button>
                  <button
                    onClick={() => setGameConfig({ ...gameConfig, responseMode: 'full' })}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors",
                      gameConfig.responseMode === 'full' ? "bg-[#F27D26] text-black" : "text-[#8E9299] hover:text-white"
                    )}
                  >
                    Full (Đợi viết xong)
                  </button>
                </div>
                <div className="text-[10px] text-[#8E9299] italic pl-1">
                  * Chế độ Streaming sẽ hiển thị văn bản ngay khi AI đang tạo. (Tùy thuộc vào Proxy có hỗ trợ Stream hay không).
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Pin className="w-4 h-4 text-[#F27D26]" /> Góc nhìn kể chuyện
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Ngôi thứ nhất', 'Ngôi thứ hai', 'Ngôi thứ ba'].map(p => (
                    <button
                      key={p}
                      onClick={() => setGameConfig({ ...gameConfig, perspective: p })}
                      className={cn(
                        "py-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all",
                        gameConfig.perspective === p 
                          ? "bg-[#F27D26] text-black border-[#F27D26] shadow-[0_0_10px_rgba(242,125,38,0.3)]" 
                          : "bg-[#141414] border-[#333] text-gray-400 hover:border-gray-600"
                      )}
                    >
                      {p === 'Ngôi thứ nhất' ? 'Ngôi 1' : p === 'Ngôi thứ hai' ? 'Ngôi 2' : 'Ngôi 3'}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-[#8E9299] italic pl-1">
                  * Hệ thống sẽ tự động điều chỉnh cách xưng hô (Tôi/Bạn/Hắn) dựa trên lựa chọn này.
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#F27D26]" /> Thể loại & Bối cảnh (Chọn nhiều)
                </label>
                
                <div className="space-y-4">
                  {GENRE_GROUPS.map(group => (
                    <div key={group.category} className="space-y-2">
                      <div className="text-[10px] font-bold text-[#8E9299] uppercase tracking-widest pl-1">{group.category}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.genres.map(genre => {
                          const currentGenres = gameConfig.genre.split(',').map(g => g.trim()).filter(g => g.length > 0);
                          const isSelected = currentGenres.includes(genre.name);
                          
                          return (
                            <button
                              key={genre.name}
                              onClick={() => {
                                let newGenres: string[];
                                if (isSelected) {
                                  newGenres = currentGenres.filter(g => g !== genre.name);
                                } else {
                                  newGenres = [...currentGenres, genre.name];
                                }
                                
                                // Maintain primary genre for stylistic fallback
                                const primaryGenre = newGenres[0] || "Tu Tiên";
                                const availableAuthors = GENRE_AUTHORS[primaryGenre] || DEFAULT_AUTHORS;
                                const currentStyleInNewList = availableAuthors.some(a => a.name === gameConfig.style);
                                
                                setGameConfig({ 
                                  ...gameConfig, 
                                  genre: newGenres.join(', '),
                                  style: currentStyleInNewList ? gameConfig.style : availableAuthors[0].name
                                });
                              }}
                              className={cn(
                                "text-left p-3 rounded-lg border transition-all relative group overflow-hidden",
                                isSelected 
                                  ? "bg-[#F27D26]/10 border-[#F27D26] shadow-[0_0_10px_rgba(242,125,38,0.2)]" 
                                  : "bg-[#141414] border-[#333] hover:border-[#444] hover:bg-[#1a1a1a]"
                              )}
                            >
                              <div className={cn(
                                "text-xs font-bold mb-0.5 flex items-center justify-between",
                                isSelected ? "text-[#F27D26]" : "text-white"
                              )}>
                                {genre.name}
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <div className="text-[9px] text-[#8E9299] leading-tight line-clamp-1">{genre.desc}</div>
                              {/* Hover tooltip for examples */}
                              <div className="absolute inset-0 bg-[#112240] translate-y-full group-hover:translate-y-0 transition-transform p-3 z-10 flex flex-col justify-center">
                                <div className="text-[9px] text-[#F27D26] font-bold uppercase mb-0.5">Ví dụ:</div>
                                <div className="text-[10px] text-white italic line-clamp-2">{genre.examples}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-white uppercase tracking-wider">Văn phong tác giả</label>
                <select
                  value={gameConfig.style}
                  onChange={e => setGameConfig({ ...gameConfig, style: e.target.value })}
                  className="w-full bg-[#141414] border border-[#333] rounded-lg p-3 text-white text-sm focus:border-[#F27D26] focus:outline-none"
                >
                  {(() => {
                    const primaryGenre = gameConfig.genre.split(',')[0]?.trim();
                    const authors = (primaryGenre && GENRE_AUTHORS[primaryGenre]) ? GENRE_AUTHORS[primaryGenre] : DEFAULT_AUTHORS;
                    return authors.map(author => (
                      <option key={author.name} value={author.name}>
                        {author.name} ({author.desc})
                      </option>
                    ));
                  })()}
                  {/* Always include Default options if not already there */}
                  {(() => {
                    const primaryGenre = gameConfig.genre.split(',')[0]?.trim();
                    const authors = (primaryGenre && GENRE_AUTHORS[primaryGenre]) ? GENRE_AUTHORS[primaryGenre] : [];
                    return DEFAULT_AUTHORS.filter(d => !authors.some(a => a.name === d.name)).map(d => (
                      <option key={d.name} value={d.name}>{d.name} ({d.desc})</option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'character' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              {/* Currency Display - Separate and Prominent */}
              <div className="bg-gradient-to-r from-[#F27D26]/20 to-[#F27D26]/5 p-4 rounded-xl border border-[#F27D26]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F27D26]/20 rounded-lg">
                    <Coins className="w-5 h-5 text-[#F27D26]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest">{gameState.character.currency?.name || 'Tiền tệ'}</div>
                    <div className="text-xl font-black text-white tabular-nums">{gameState.character.currency?.amount || '0'}</div>
                  </div>
                </div>
              </div>

              {/* System Points - Only for System Genre */}
              {gameConfig.genre.toLowerCase().includes('hệ thống') && (
                <div className="bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest">Điểm Hệ Thống</div>
                      <div className="text-xl font-black text-white tabular-nums">{gameState.character.system_points || '0'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info: Grid 2 columns for short values */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Tên', icon: <Users className="w-3 h-3" /> },
                  { key: 'age', label: 'Tuổi', icon: <History className="w-3 h-3" /> }
                ].map((item) => (
                  <div key={item.key} className="bg-[#141414] p-3 rounded-lg border border-[#222]">
                    <div className="text-[9px] text-[#8E9299] uppercase tracking-wider mb-1 flex items-center gap-1">
                      {item.icon} {item.label}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {String((gameState.character as any)?.[item.key] || 'Chưa rõ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Core Stats & Detailed Info: Single column for long text wrapping */}
              <div className="space-y-3">
                {[
                  { key: 'level', label: 'Tu vi / Cấp độ', icon: <Zap className="w-3 h-3 text-yellow-400" /> },
                  { key: 'hp', label: 'HP / Năng lượng', icon: <Heart className="w-3 h-3 text-red-400" /> },
                  { key: 'stats', label: 'Thể chất / Huyết mạch', icon: <Brain className="w-3 h-3 text-blue-400" /> },
                  { key: 'potential', label: 'Tiềm năng / Căn cốt', icon: <Sparkles className="w-3 h-3 text-purple-400" /> },
                  { key: 'reputation', label: 'Danh vọng', icon: <Crown className="w-3 h-3 text-orange-400" /> },
                  { key: 'status', label: 'Trạng thái', icon: <Zap className="w-3 h-3 text-green-400" /> },
                  { key: 'location', label: 'Vị trí hiện tại', icon: <Map className="w-3 h-3 text-indigo-400" /> }
                ].map((item) => (
                  <div key={item.key} className="bg-[#141414] p-3 rounded-lg border border-[#222] transition-colors hover:border-[#333]">
                    <div className="text-[9px] text-[#8E9299] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-bold">
                      {item.icon} {item.label}
                    </div>
                    <div className="text-sm text-white leading-relaxed break-words">
                      {String((gameState.character as any)?.[item.key] || 'Chưa rõ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Display */}
              <div className="bg-[#141414] p-4 rounded-xl border border-[#222] transition-all hover:border-[#333]">
                <div className="text-[10px] text-[#F27D26] uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                   <Zap className="w-3.5 h-3.5" /> Công pháp & Kỹ năng
                </div>
                <div className="flex flex-wrap gap-2">
                  {typeof gameState.character.skills === 'string' && gameState.character.skills.toLowerCase() !== 'không' ? (
                    gameState.character.skills.split(/[,|\n]+/).map(s => s.trim()).filter(s => s.length > 0 && s.toLowerCase() !== 'không').map((s, i) => (
                      <div key={i} className="px-3 py-1.5 bg-[#1d2d50]/30 border border-[#1d2d50] rounded-lg text-xs text-[#D1D1D1] flex items-center gap-2 group transition-all hover:bg-[#1d2d50]/50 hover:border-[#F27D26]/30">
                        <div className="w-1 h-1 rounded-full bg-[#F27D26]" />
                        <span className="leading-relaxed">{s}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#444] italic">Chưa lĩnh ngộ kỹ năng nào.</div>
                  )}
                </div>
              </div>

              {/* Inventory Tabs */}
              <div className="space-y-3">
                <div className="text-[9px] text-[#F27D26] uppercase font-bold tracking-wider flex items-center gap-1.5 pl-1">
                   <Package className="w-3 h-3" /> Hành trang phân loại
                </div>
                
                <InventoryTabs inventory={gameState.character.inventory || {}} />
              </div>
              
              {/* Detailed Physical Characteristics for MC */}
              {gameState.character.physical_details && typeof gameState.character.physical_details === 'object' && (
                <div className="space-y-3 mt-4">
                  <h3 className="text-xs font-bold text-[#F27D26] uppercase tracking-widest border-l-2 border-[#F27D26] pl-2">Đặc điểm hình thể</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(gameState.character.physical_details).map(([part, desc]) => (
                      <div key={part} className="bg-[#1d2d50]/20 p-3 rounded-lg border border-[#1d2d50]/50">
                        <div className="text-[10px] text-[#F27D26] uppercase font-bold mb-1">{part}</div>
                        <div className="text-sm text-[#D1D1D1] leading-relaxed">{String(desc)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#F27D26] uppercase">Đạo lữ / Người yêu</h3>
                {gameState.relationships && Array.isArray(gameState.relationships.partners) && gameState.relationships.partners.length > 0 ? (
                  gameState.relationships.partners.map((p, i) => <div key={i} className="text-sm text-white bg-[#141414] p-2 rounded border border-[#222]">{String(p)}</div>)
                ) : <div className="text-xs text-[#8E9299] italic">Chưa có</div>}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-blue-400 uppercase">Đồng minh</h3>
                {gameState.relationships && Array.isArray(gameState.relationships.allies) && gameState.relationships.allies.length > 0 ? (
                  gameState.relationships.allies.map((a, i) => <div key={i} className="text-sm text-white bg-[#141414] p-2 rounded border border-[#222]">{String(a)}</div>)
                ) : <div className="text-xs text-[#8E9299] italic">Chưa có</div>}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-red-400 uppercase">Kẻ thù</h3>
                {gameState.relationships && Array.isArray(gameState.relationships.enemies) && gameState.relationships.enemies.length > 0 ? (
                  gameState.relationships.enemies.map((e, i) => <div key={i} className="text-sm text-white bg-[#141414] p-2 rounded border border-[#222]">{String(e)}</div>)
                ) : <div className="text-xs text-[#8E9299] italic">Chưa có</div>}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-purple-400 uppercase">Tù binh / Nô lệ</h3>
                {gameState.relationships && Array.isArray(gameState.relationships.captives) && gameState.relationships.captives.length > 0 ? (
                  gameState.relationships.captives.map((c, i) => <div key={i} className="text-sm text-white bg-[#141414] p-2 rounded border border-[#222]">{String(c)}</div>)
                ) : <div className="text-xs text-[#8E9299] italic">Chưa có</div>}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-yellow-500 uppercase flex items-center gap-2">
                  <Crown className="w-4 h-4" /> Thế lực của MC
                </h3>
                {gameState.relationships && Array.isArray(gameState.relationships.mc_factions) && gameState.relationships.mc_factions.length > 0 ? (
                  gameState.relationships.mc_factions.map((f, i) => (
                    <div key={i} className="text-sm text-white bg-[#141414] p-3 rounded border border-yellow-500/20 leading-relaxed">
                      {String(f)}
                    </div>
                  ))
                ) : <div className="text-xs text-[#8E9299] italic">Chưa có thế lực nào do bạn nắm giữ.</div>}
              </div>
            </div>
          )}

          {activeTab === 'codex' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Codex Sub-tabs */}
              <div className="flex gap-1 bg-[#0a192f] p-1 rounded-lg border border-[#1d2d50]">
                {[
                  { id: 'npcs', icon: <Users className="w-3.5 h-3.5" />, label: 'NPCs' },
                  { id: 'factions', icon: <Shield className="w-3.5 h-3.5" />, label: 'Thế lực' },
                  { id: 'locations', icon: <Map className="w-3.5 h-3.5" />, label: 'Địa lý' },
                  { id: 'power', icon: <Zap className="w-3.5 h-3.5" />, label: 'Cảnh giới' },
                  { id: 'laws', icon: <Gavel className="w-3.5 h-3.5" />, label: 'Luật lệ' },
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setCodexSubTab(sub.id as any)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-md transition-all",
                      codexSubTab === sub.id 
                        ? "bg-[#1d2d50] text-[#F27D26] shadow-sm" 
                        : "text-[#8E9299] hover:text-white hover:bg-[#1d2d50]/50"
                    )}
                  >
                    {sub.icon}
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{sub.label}</span>
                  </button>
                ))}
              </div>

              {/* Sub-tab Content */}
              <div className="space-y-4">
                {codexSubTab === 'npcs' && (
                  <div className="space-y-4">
                    {/* Pinned NPCs */}
                    {gameState.pinned_codex && Array.isArray(gameState.pinned_codex.npcs) && gameState.pinned_codex.npcs.map((memory, i) => (
                      <div key={`pinned-${i}`} className="bg-[#1d2d50]/30 p-4 rounded-lg border border-[#F27D26]/30 relative group">
                        <div className="absolute -top-2 -left-2 bg-[#F27D26] text-black p-1 rounded-full shadow-lg">
                          <Pin className="w-3 h-3" />
                        </div>
                        <button 
                          onClick={() => {
                            setGameState(prev => ({
                              ...prev,
                              pinned_codex: {
                                ...prev.pinned_codex!,
                                npcs: prev.pinned_codex!.npcs.filter((_, idx) => idx !== i)
                              }
                            }));
                          }}
                          className="absolute top-2 right-2 p-1.5 text-[#F27D26] hover:bg-[#F27D26]/10 rounded-md transition-all"
                          title="Bỏ ghim"
                        >
                          <PinOff className="w-4 h-4" />
                        </button>
                        <div className="text-sm font-bold text-[#F27D26] mb-2">{typeof memory === 'string' ? memory.split('\n')[0] : 'Thông tin'}</div>
                        <p className="text-sm text-[#D1D1D1] leading-relaxed italic opacity-80">{String(memory)}</p>
                      </div>
                    ))}

                    {gameState.entity_memory && Array.isArray(gameState.entity_memory) && gameState.entity_memory.length > 0 ? (
                      gameState.entity_memory.map((entity, i) => {
                        const isExpanded = expandedNpcs.has(i);
                        const toggleExpand = () => {
                          const newExpanded = new Set(expandedNpcs);
                          if (isExpanded) {
                            newExpanded.delete(i);
                          } else {
                            newExpanded.add(i);
                          }
                          setExpandedNpcs(newExpanded);
                        };

                        if (!entity) return null;

                        return (
                          <div key={i} className="bg-[#141414] rounded-lg border border-[#222] relative group overflow-hidden transition-all hover:border-[#333]">
                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const info = `${entity.name} (${entity.status})${entity.cultivation ? ` - ${entity.cultivation}` : ''}\n${entity.memory}`;
                                  setGameState(prev => ({
                                    ...prev,
                                    pinned_codex: {
                                      ...prev.pinned_codex!,
                                      npcs: [...new Set([...(prev.pinned_codex?.npcs || []), info])]
                                    }
                                  }));
                                }}
                                className="p-1.5 text-cyan-400 hover:bg-cyan-400/20 bg-[#222]/80 backdrop-blur-sm rounded-md shadow-sm border border-cyan-400/30"
                                title="Ghim hồ sơ"
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGameState(prev => ({
                                    ...prev,
                                    entity_memory: prev.entity_memory.filter((_, index) => index !== i)
                                  }));
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-500/20 bg-[#222]/80 backdrop-blur-sm rounded-md shadow-sm border border-red-500/30"
                                title="Xóa hồ sơ NPC"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Header / Summary View (Always Visible) */}
                            <div 
                              onClick={toggleExpand}
                              className="p-4 cursor-pointer select-none"
                            >
                              <div className="flex justify-between items-start pr-16">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className={cn(
                                      "text-sm font-bold",
                                      entity.isDead ? "text-gray-500" : "text-[#F27D26]"
                                    )}>
                                      {entity.name}
                                    </h3>
                                    {entity.isDead && <Skull className="w-3.5 h-3.5 text-gray-500" />}
                                    {!entity.isDead && entity.age && <span className="text-[10px] text-[#8E9299]">({entity.age} tuổi)</span>}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {entity.mood && !entity.isDead && (
                                      <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20 italic">
                                        {entity.mood}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-[#8E9299] bg-[#222] px-2 py-0.5 rounded uppercase font-bold tracking-tight">
                                      {entity.status || 'Bình thường'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {gameConfig.genre !== 'Đô Thị' && entity.cultivation && (
                                    <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 font-bold">
                                      {entity.cultivation}
                                    </span>
                                  )}
                                  <div className="text-[10px] text-[#8E9299] flex items-center gap-1">
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                                  </div>
                                </div>
                              </div>

                              {/* Mini Relationship Progress Bars */}
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                {['loyalty', 'affection', 'desire'].map((key) => (
                                  <div key={key} className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full transition-all duration-500",
                                        key === 'loyalty' ? "bg-blue-500" : key === 'affection' ? "bg-pink-500" : "bg-purple-500"
                                      )}
                                      style={{ width: `${(entity as any)[key] || (key === 'desire' ? 0 : 20)}%` }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Detailed View (Collapsible) */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="px-4 pb-4 border-t border-white/5 bg-white/[0.02]"
                                >
                                  <div className="pt-4 space-y-4">
                                    {/* Full Relationship Gauges */}
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-blue-400">
                                          <span>Tin tưởng</span>
                                          <span>{entity.loyalty || 50}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                          <div className="h-full bg-blue-500" style={{ width: `${entity.loyalty || 50}%` }} />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-pink-400">
                                          <span>Hảo cảm</span>
                                          <span>{entity.affection || 20}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                          <div className="h-full bg-pink-500" style={{ width: `${entity.affection || 20}%` }} />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter text-purple-400">
                                          <span>Dục vọng</span>
                                          <span>{entity.desire || 0}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                          <div className="h-full bg-purple-500" style={{ width: `${entity.desire || 0}%` }} />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                      <div className="text-xs">
                                        <span className="text-[#8E9299] font-bold">Tính cách:</span> <span className="text-[#D1D1D1]">{entity.personality || 'Chưa rõ'} {entity.personality_type && `(${entity.personality_type})`}</span>
                                      </div>
                                      <div className="text-xs">
                                        <span className="text-[#F27D26] font-bold">Công pháp/Kỹ năng:</span> <span className="text-blue-300">{entity.skills || 'Không'}</span>
                                      </div>
                                      <div className="text-xs border-l-2 border-yellow-500/50 pl-2 py-0.5 bg-yellow-500/5">
                                        <span className="text-yellow-500 font-bold">Mục tiêu:</span> <span className="text-[#D1D1D1] italic">{entity.goal || 'Không rõ'}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {entity.current_location && (
                                          <div className="text-xs">
                                            <span className="text-emerald-400 font-bold">Vị trí:</span> <span className="text-[#D1D1D1]">{entity.current_location}</span>
                                          </div>
                                        )}
                                        {entity.secret && entity.secret !== 'Chưa rõ' && entity.secret !== 'Bí mật' && (
                                          <div className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                            <span className="font-bold">Bí mật:</span> {entity.secret}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {entity.appearance_summary && (
                                      <div className="text-xs text-white/90 bg-white/5 p-2 rounded border border-white/10 italic">
                                        {entity.appearance_summary}
                                      </div>
                                    )}

                                    <div className="space-y-1">
                                      <p className="text-sm text-[#D1D1D1] leading-relaxed italic">"{entity.memory}"</p>
                                      {entity.origin && (
                                        <div className="text-[10px] text-gray-500">
                                          <span className="font-bold">Xuất thân:</span> {entity.origin}
                                        </div>
                                      )}
                                    </div>

                                    {(entity.likes || entity.dislikes) && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="text-[10px] bg-green-500/5 border border-green-500/20 p-1.5 rounded">
                                          <span className="text-green-400 font-bold block uppercase mb-0.5">Thích</span>
                                          <span className="text-[#D1D1D1]">{entity.likes || 'Chưa rõ'}</span>
                                        </div>
                                        <div className="text-[10px] bg-red-500/5 border border-red-500/20 p-1.5 rounded">
                                          <span className="text-red-400 font-bold block uppercase mb-0.5">Ghét</span>
                                          <span className="text-[#D1D1D1]">{entity.dislikes || 'Chưa rõ'}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Detailed Physical Characteristics for NPCs */}
                                    <div className="bg-[#0a192f]/40 p-3 rounded-lg border border-[#1d2d50]">
                                      <div className="text-[10px] text-pink-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> Đặc điểm hình thể & NSFW
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[10px] text-pink-300 font-bold">Số đo:</span>
                                          <span className="text-xs text-[#D1D1D1]">{entity.measurements || 'Bí mật'}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-[10px] text-pink-300 font-bold">Kinh nghiệm:</span>
                                          <span className="text-xs text-[#D1D1D1]">{entity.sexual_history || 'Bí mật'}</span>
                                        </div>
                                        {entity.physical_details && typeof entity.physical_details === 'object' && Object.entries(entity.physical_details).map(([part, desc]) => (
                                          <div key={part} className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-[#8E9299] font-bold">{part}:</span>
                                            <span className="text-xs text-[#D1D1D1] italic">{String(desc)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {entity.relationships_with_others && entity.relationships_with_others.length > 0 && (
                                      <div className="pt-3 border-t border-white/5 space-y-1">
                                        <div className="text-[10px] text-[#8E9299] uppercase font-bold tracking-wider">Quan hệ xã hội:</div>
                                        {entity.relationships_with_others.map((rel, idx) => (
                                          <div key={idx} className="text-xs text-[#4FD1C5] flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-[#4FD1C5]" />
                                            {rel}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-[#8E9299] italic text-center p-4">Chưa có hồ sơ NPC nào.</div>
                    )}
                  </div>
                )}

                {codexSubTab === 'factions' && (
                  <div className="space-y-2">
                    {/* Pinned Factions */}
                    {gameState.pinned_codex && Array.isArray(gameState.pinned_codex.factions) && gameState.pinned_codex.factions.map((item, i) => (
                      <div key={`pinned-f-${i}`} className="text-sm text-white bg-[#1d2d50]/30 p-3 rounded border border-[#F27D26]/30 relative group">
                        <Pin className="w-3 h-3 text-[#F27D26] absolute -top-1.5 -left-1.5" />
                        <button 
                          onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, factions: prev.pinned_codex!.factions.filter((_, idx) => idx !== i) } }))}
                          className="absolute top-2 right-2 text-[#F27D26] opacity-0 group-hover:opacity-100"
                        >
                          <PinOff className="w-3.5 h-3.5" />
                        </button>
                        {String(item)}
                      </div>
                    ))}
                    {gameState.lore_book && Array.isArray(gameState.lore_book.factions_locations) && gameState.lore_book.factions_locations.filter(item => !(item || '').toLowerCase().includes('địa danh:')).length > 0 ? (
                      gameState.lore_book.factions_locations
                        .filter(item => !(item || '').toLowerCase().includes('địa danh:'))
                        .map((item, i) => (
                          <div key={i} className="text-sm text-white bg-[#141414] p-3 rounded border border-[#222] leading-relaxed relative group">
                            <button 
                              onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, factions: [...new Set([...(prev.pinned_codex?.factions || []), item])] } }))}
                              className="absolute top-2 right-2 text-cyan-400 bg-[#222] p-1 rounded border border-cyan-400/30 transition-all"
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            {String(item)}
                          </div>
                        ))
                    ) : <div className="text-xs text-[#8E9299] italic text-center p-4">Chưa có thông tin thế lực.</div>}
                  </div>
                )}

                {codexSubTab === 'locations' && (
                  <div className="space-y-2">
                    {/* Pinned Locations */}
                    {gameState.pinned_codex && Array.isArray(gameState.pinned_codex.locations) && gameState.pinned_codex.locations.map((item, i) => (
                      <div key={`pinned-l-${i}`} className="text-sm text-white bg-[#1d2d50]/30 p-3 rounded border border-[#F27D26]/30 relative group">
                        <Pin className="w-3 h-3 text-[#F27D26] absolute -top-1.5 -left-1.5" />
                        <button 
                          onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, locations: prev.pinned_codex!.locations.filter((_, idx) => idx !== i) } }))}
                          className="absolute top-2 right-2 text-[#F27D26] opacity-0 group-hover:opacity-100"
                        >
                          <PinOff className="w-3.5 h-3.5" />
                        </button>
                        {String(item)}
                      </div>
                    ))}
                    {gameState.lore_book && Array.isArray(gameState.lore_book.factions_locations) && gameState.lore_book.factions_locations.filter(item => (item || '').toLowerCase().includes('địa danh:')).length > 0 ? (
                      gameState.lore_book.factions_locations
                        .filter(item => (item || '').toLowerCase().includes('địa danh:'))
                        .map((item, i) => (
                          <div key={i} className="text-sm text-white bg-[#141414] p-3 rounded border border-[#222] leading-relaxed relative group">
                            <button 
                              onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, locations: [...new Set([...(prev.pinned_codex?.locations || []), item])] } }))}
                              className="absolute top-2 right-2 text-cyan-400 bg-[#222] p-1 rounded border border-cyan-400/30 transition-all"
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            {String(item)}
                          </div>
                        ))
                    ) : <div className="text-xs text-[#8E9299] italic text-center p-4">Chưa có thông tin địa danh.</div>}
                  </div>
                )}

                {codexSubTab === 'power' && (
                  <div className="space-y-2">
                    {gameConfig.genre === 'Đô Thị' ? (
                      <div className="text-sm text-[#8E9299] italic text-center p-4 bg-[#141414] rounded border border-[#222]">
                        Thể loại Đô Thị không áp dụng hệ thống cảnh giới sức mạnh.
                      </div>
                    ) : (
                      <>
                        {/* Pinned Power */}
                        {gameState.pinned_codex && Array.isArray(gameState.pinned_codex.power) && gameState.pinned_codex.power.map((item, i) => (
                          <div key={`pinned-p-${i}`} className="text-sm text-blue-400 bg-[#1d2d50]/30 p-3 rounded border border-[#F27D26]/30 relative group flex items-center gap-3">
                            <Pin className="w-3 h-3 text-[#F27D26] absolute -top-1.5 -left-1.5" />
                            <button 
                              onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, power: prev.pinned_codex!.power.filter((_, idx) => idx !== i) } }))}
                              className="absolute top-2 right-2 text-[#F27D26] opacity-0 group-hover:opacity-100"
                            >
                              <PinOff className="w-3.5 h-3.5" />
                            </button>
                            <Zap className="w-4 h-4 shrink-0" />
                            {String(item)}
                          </div>
                        ))}
                        {gameState.lore_book && Array.isArray(gameState.lore_book.power_system) && gameState.lore_book.power_system.length > 0 ? (
                          gameState.lore_book.power_system.map((item, i) => (
                            <div key={i} className="text-sm text-blue-400 bg-blue-400/5 p-3 rounded border border-blue-400/20 flex items-center gap-3 relative group">
                              <button 
                                onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, power: [...new Set([...(prev.pinned_codex?.power || []), item])] } }))}
                                className="absolute top-2 right-2 text-cyan-400 bg-[#222] p-1 rounded border border-cyan-400/30 transition-all"
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <Zap className="w-4 h-4 shrink-0" />
                              {String(item)}
                            </div>
                          ))
                        ) : <div className="text-xs text-[#8E9299] italic text-center p-4">Chưa xác định hệ thống cảnh giới.</div>}
                      </>
                    )}
                  </div>
                )}

                {codexSubTab === 'laws' && (
                  <div className="space-y-2">
                    {/* Pinned Laws */}
                    {gameState.pinned_codex && Array.isArray(gameState.pinned_codex.laws) && gameState.pinned_codex.laws.map((item, i) => (
                      <div key={`pinned-law-${i}`} className="text-sm text-red-400 bg-[#1d2d50]/30 p-3 rounded border border-[#F27D26]/30 relative group flex items-start gap-3">
                        <Pin className="w-3 h-3 text-[#F27D26] absolute -top-1.5 -left-1.5" />
                        <button 
                          onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, laws: prev.pinned_codex!.laws.filter((_, idx) => idx !== i) } }))}
                          className="absolute top-2 right-2 text-[#F27D26] opacity-0 group-hover:opacity-100"
                        >
                          <PinOff className="w-3.5 h-3.5" />
                        </button>
                        <Gavel className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{String(item)}</span>
                      </div>
                    ))}
                    {gameState.lore_book && Array.isArray(gameState.lore_book.world_laws) && gameState.lore_book.world_laws.length > 0 ? (
                      gameState.lore_book.world_laws.map((item, i) => (
                        <div key={i} className="text-sm text-red-400 bg-red-400/5 p-3 rounded border border-red-400/20 flex items-start gap-3 relative group">
                          <button 
                            onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, laws: [...new Set([...(prev.pinned_codex?.laws || []), item])] } }))}
                            className="absolute top-2 right-2 text-cyan-400 bg-[#222] p-1 rounded border border-cyan-400/30 transition-all"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <Gavel className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{String(item)}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        {gameState.lore_book && Array.isArray(gameState.lore_book.world_rules) && gameState.lore_book.world_rules.length > 0 ? (
                          gameState.lore_book.world_rules.map((item, i) => (
                            <div key={i} className="text-sm text-white bg-[#141414] p-3 rounded border border-[#222] leading-relaxed relative group">
                              <button 
                                onClick={() => setGameState(prev => ({ ...prev, pinned_codex: { ...prev.pinned_codex!, laws: [...new Set([...(prev.pinned_codex?.laws || []), item])] } }))}
                                className="absolute top-2 right-2 text-cyan-400 bg-[#222] p-1 rounded border border-cyan-400/30 transition-all"
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              {String(item)}
                            </div>
                          ))
                        ) : <div className="text-xs text-[#8E9299] italic text-center p-4">Chưa có luật lệ thế giới nào được ghi nhận.</div>}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lsr' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="bg-[#141414] p-4 rounded-lg border border-[#222]">
                <h3 className="text-xs font-bold text-[#F27D26] uppercase mb-2">Ngắn hạn (Lượt gần nhất)</h3>
                <p className="text-sm text-[#D1D1D1]">{gameState.lsr?.short || 'Chưa có thông tin.'}</p>
              </div>
              <div className="bg-[#141414] p-4 rounded-lg border border-[#222]">
                <h3 className="text-xs font-bold text-[#F27D26] uppercase mb-2">Trung hạn</h3>
                <p className="text-sm text-[#D1D1D1]">{gameState.lsr?.medium || 'Chưa có thông tin.'}</p>
              </div>
              <div className="bg-[#141414] p-4 rounded-lg border border-[#222]">
                <h3 className="text-xs font-bold text-[#F27D26] uppercase mb-2">Dài hạn (Cốt truyện chính)</h3>
                <p className="text-sm text-[#D1D1D1]">{gameState.lsr?.long || 'Chưa có thông tin.'}</p>
              </div>
              <div className="mt-4 p-3 border border-dashed border-[#333] rounded-lg text-center">
                <p className="text-xs text-[#8E9299]">Hệ thống Trí nhớ vĩnh cửu (Embeddings) đang hoạt động ngầm.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#222] grid grid-cols-3 gap-2">
          <button onClick={handleSaveGame} className="flex flex-col items-center justify-center gap-1 p-2 bg-[#141414] hover:bg-[#222] rounded-lg text-[#8E9299] hover:text-white transition-colors">
            <Save className="w-4 h-4" />
            <span className="text-[10px] uppercase">Lưu Game</span>
          </button>
          <button onClick={() => saveFileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1 p-2 bg-[#141414] hover:bg-[#222] rounded-lg text-[#8E9299] hover:text-white transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-[10px] uppercase">Tải Game</span>
          </button>
          <input type="file" accept=".json" ref={saveFileInputRef} onChange={handleLoadGame} className="hidden" />
          <button 
            onClick={() => { 
              if (showResetConfirm) {
                resetGame();
                setShowResetConfirm(false);
                localStorage.setItem('grok_current_page', '1');
                onClose();
              } else {
                setShowResetConfirm(true);
                setTimeout(() => setShowResetConfirm(false), 3000);
              }
            }} 
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200",
              showResetConfirm 
                ? "bg-red-600 text-white scale-105 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                : "bg-[#141414] hover:bg-red-900/30 text-[#8E9299] hover:text-red-400"
            )}
          >
            <RotateCcw className={cn("w-4 h-4", showResetConfirm && "animate-spin")} />
            <span className="text-[10px] uppercase font-bold">
              {showResetConfirm ? "Xác nhận?" : "Chơi lại"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
