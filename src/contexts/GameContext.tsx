import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type InventoryState = {
  equipment: string;
  items: string;
  materials: string;
};

export type CurrencyState = {
  name: string;
  amount: string;
};

export type CharacterState = {
  name: string;
  age: string;
  level: string;
  hp: string;
  stats: string;
  potential: string;
  reputation: string;
  status: string;
  skills: string;
  inventory: InventoryState;
  currency: CurrencyState;
  location: string;
  physical_details?: Record<string, string>;
  system_points?: string;
};

export type RelationshipsState = {
  partners: string[];
  allies: string[];
  enemies: string[];
  captives: string[];
  mc_factions?: string[];
};

export type LSRState = {
  short: string;
  medium: string;
  long: string;
};

export type LoreBookState = {
  factions_locations: string[];
  world_rules: string[];
  power_system?: string[];
  world_laws?: string[];
};

export type EntityMemoryState = {
  name: string;
  age?: string;
  personality?: string;
  goal?: string;
  skills?: string;
  sexual_history?: string;
  measurements?: string;
  status: string;
  mood?: string;
  memory: string;
  origin?: string;
  personality_type?: string;
  likes?: string;
  dislikes?: string;
  secret?: string;
  current_location?: string;
  appearance_summary?: string;
  cultivation?: string;
  loyalty?: number; // 0-100
  affection?: number; // 0-100
  desire?: number; // 0-100
  isDead?: boolean;
  relationships_with_others?: string[];
  physical_details?: Record<string, string>;
};

export type GameConfig = {
  model: string;
  genre: string; // Will store multiple genres as a comma-separated string
  style: string;
  perspective: 'Ngôi thứ nhất' | 'Ngôi thứ hai' | 'Ngôi thứ ba' | string;
  wordCount: number;
  responseMode: 'streaming' | 'full';
};

export type ProxyConfig = {
  name: string;
  url: string;
  key: string;
  model: string;
  availableModels: string[];
};

export type AIConfig = {
  proxy1: ProxyConfig;
  proxy2: ProxyConfig;
  apiKeys: string[];
  currentKeyIndex: number;
  proxyUrl?: string; // legacy
  gcliKey?: string; // legacy
};

export type AIStatus = {
  currentMethod: string;
  errors: Array<{ method: string; error: string; time: string }>;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  displayContent?: string;
};

export type FactionDynamic = {
  name: string;
  power: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  status: string;
};

export type GameState = {
  character: CharacterState;
  lore_book: LoreBookState;
  entity_memory: EntityMemoryState[];
  summaries: string[];
  relationships: RelationshipsState;
  lsr: LSRState;
  world_events: string[];
  world_time: string; // "Năm 1, Tháng 1, Ngày 1"
  factions_dynamics?: FactionDynamic[];
  messages: Message[];
  currentPage: number;
  pinned_codex?: {
    npcs: string[];
    factions: string[];
    locations: string[];
    power: string[];
    laws: string[];
  };
};

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameConfig: GameConfig;
  setGameConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  aiConfig: AIConfig;
  setAiConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
  aiStatus: AIStatus;
  setAiStatus: React.Dispatch<React.SetStateAction<AIStatus>>;
  updateStateFromAI: (jsonString: string) => void;
  resetGame: () => void;
}

const getDefaultGameState = (): GameState => ({
  character: { 
    name: 'Chưa có', 
    age: 'Chưa rõ',
    level: 'Chưa có', 
    hp: '100/100', 
    stats: 'Bình thường', 
    potential: 'Chưa xác định',
    reputation: 'Vô danh tiểu tử',
    status: 'Khỏe mạnh', 
    skills: 'Không', 
    inventory: {
      equipment: 'Trống',
      items: 'Trống',
      materials: 'Trống'
    },
    currency: {
      name: 'Linh thạch',
      amount: '0'
    },
    location: 'Chưa rõ',
    physical_details: {
      "Ngực": "Chưa xác định",
      "Mông": "Chưa xác định",
      "Vùng kín": "Chưa xác định",
      "Dấu vết": "Không có"
    },
    system_points: '0'
  },
  summaries: [],
  lore_book: { factions_locations: [], world_rules: [], power_system: [], world_laws: [] },
  entity_memory: [],
  world_events: [],
  world_time: 'Năm 1, Tháng 1, Ngày 1',
  factions_dynamics: [],
  relationships: { partners: [], allies: [], enemies: [], captives: [], mc_factions: [] },
  lsr: { short: 'Chưa có', medium: 'Chưa có', long: 'Chưa có' },
  messages: [
    {
      id: 'initial',
      role: 'assistant',
      content: 'Chào mừng bạn đến với hệ thống Grok RPG Engine v1.2. Hiện tại, tôi đã được tích hợp khả năng "Truy vấn Grok" (Search Grounding) để mang lại kiến thức thực tế và dữ liệu thời gian thực vào hành trình của bạn. Hãy nhập "Bắt đầu" để khởi tạo thế giới, chọn tên nhân vật và tu vi ban đầu.',
      displayContent: 'Chào mừng bạn đến với hệ thống Grok RPG Engine v1.2. Hiện tại, tôi đã được tích hợp khả năng "Truy vấn Grok" (Search Grounding) để mang lại kiến thức thực tế và dữ liệu thời gian thực vào hành trình của bạn. Hãy nhập "Bắt đầu" để khởi tạo thế giới, chọn tên nhân vật và tu vi ban đầu.'
    }
  ],
  currentPage: 1,
  pinned_codex: {
    npcs: [],
    factions: [],
    locations: [],
    power: [],
    laws: []
  }
});


const defaultGameConfig: GameConfig = {
  model: 'gemini-3-flash-preview',
  genre: 'Tu Tiên',
  style: 'Vong Ngữ',
  perspective: 'Ngôi thứ ba',
  wordCount: 3500,
  responseMode: 'streaming',
};

const defaultAIConfig: AIConfig = {
  proxy1: { name: '', url: '', key: '', model: '', availableModels: [] },
  proxy2: { name: '', url: '', key: '', model: '', availableModels: [] },
  apiKeys: [],
  currentKeyIndex: 0,
};

const defaultAIStatus: AIStatus = {
  currentMethod: 'Sẵn sàng',
  errors: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('grok_gameState');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Scrub world_events to be array of strings, as sometimes AI returns objects
        if (parsed.world_events && Array.isArray(parsed.world_events)) {
          parsed.world_events = parsed.world_events.map((e: any) => 
            typeof e === 'string' ? e : (e && typeof e === 'object' ? (e.description || e.name || JSON.stringify(e)) : String(e))
          );
        }

        const defaultState = getDefaultGameState();
        return { 
          ...defaultState, 
          ...parsed,
          character: {
            ...defaultState.character,
            ...parsed.character,
            physical_details: {
              ...defaultState.character.physical_details,
              ...(parsed.character?.physical_details || {})
            }
          }
        };
      }
      return getDefaultGameState();
    } catch { return getDefaultGameState(); }
  });
  
  const [gameConfig, setGameConfig] = useState<GameConfig>(() => {
    try {
      const saved = localStorage.getItem('grok_gameConfig');
      return saved ? JSON.parse(saved) : defaultGameConfig;
    } catch { return defaultGameConfig; }
  });
  
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem('grok_aiConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration from old schema
        if (parsed.proxyUrl || parsed.gcliKey) {
          parsed.proxy1 = {
            name: 'Proxy 1',
            url: parsed.proxyUrl || '',
            key: parsed.gcliKey || '',
            model: '',
            availableModels: []
          };
          parsed.proxy2 = { name: '', url: '', key: '', model: '', availableModels: [] };
          delete parsed.proxyUrl;
          delete parsed.gcliKey;
        }
        return { ...defaultAIConfig, ...parsed };
      }
      return defaultAIConfig;
    } catch { return defaultAIConfig; }
  });
  
  const [aiStatus, setAiStatus] = useState<AIStatus>(defaultAIStatus);

  useEffect(() => {
    localStorage.setItem('grok_gameState', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('grok_gameConfig', JSON.stringify(gameConfig));
  }, [gameConfig]);

  useEffect(() => {
    localStorage.setItem('grok_aiConfig', JSON.stringify(aiConfig));
  }, [aiConfig]);

  // --- ABSOLUTE CENTER CLIENT ARCHITECTURE ---
  
  // 1. STATE REGISTRY
  const STATE_REGISTRY: Record<string, { type: string; owner: string }> = {
    "character.name": { type: "string", owner: "core" },
    "character.level": { type: "string", owner: "core" },
    "character.hp": { type: "string", owner: "core" },
    "character.skills": { type: "list", owner: "skill_module" },
    "character.inventory.items": { type: "list", owner: "item_module" },
    "character.inventory.equipment": { type: "list", owner: "item_module" },
    "character.inventory.materials": { type: "list", owner: "item_module" },
    "entity_memory": { type: "array", owner: "social_module" },
    "lore_book": { type: "object", owner: "world_module" },
    "factions_dynamics": { type: "array", owner: "world_module" },
    "relationships": { type: "object", owner: "social_module" }
  };

  // 2. UPDATE ENGINE
  const applyGameEvent = (state: GameState, event: { type: string; payload: any }): GameState => {
    const newState = JSON.parse(JSON.stringify(state)); // Deep clone
    
    switch (event.type) {
      case "UPDATE_STAT": {
        const { stat, value } = event.payload;
        if (stat === "hp") newState.character.hp = value;
        if (stat === "level") newState.character.level = value;
        break;
      }
      case "GAIN_ITEM": {
        const { item, qty } = event.payload;
        const currentItems = newState.character.inventory.items.split(/[,|\n]+/).map((i: string) => i.trim()).filter((i: string) => i && i !== 'Trống');
        currentItems.push(`${qty > 1 ? qty + ' ' : ''}${item}`);
        newState.character.inventory.items = currentItems.join(', ');
        break;
      }
      case "SKILL_UPGRADE": {
        const { skill, old_skill } = event.payload;
        const skills = newState.character.skills.split(/[,|\n]+/).map((s: string) => s.trim());
        const index = skills.findIndex((s: string) => (s?.toLowerCase() || '').includes(old_skill?.toLowerCase() || ''));
        if (index !== -1) {
          skills[index] = skill;
        } else {
          skills.push(skill);
        }
        newState.character.skills = skills.filter((s: string) => s && s !== 'Không').join(', ');
        break;
      }
      case "RELATION_CHANGE": {
        const { npcName, loyalty, affection, desire } = event.payload;
        const npc = newState.entity_memory.find((n: any) => (n.name?.toLowerCase() || '') === (npcName?.toLowerCase() || ''));
        if (npc) {
          if (loyalty) npc.loyalty = Math.min(100, Math.max(0, (npc.loyalty || 0) + parseInt(loyalty)));
          if (affection) npc.affection = Math.min(100, Math.max(0, (npc.affection || 0) + parseInt(affection)));
          if (desire) npc.desire = Math.min(100, Math.max(0, (npc.desire || 0) + parseInt(desire)));
        }
        break;
      }
      case "WORLD_EVENT": {
        const { description } = event.payload;
        newState.world_events.unshift(description);
        if (newState.world_events.length > 50) newState.world_events.pop();
        break;
      }
      case "TIME_PASS": {
        const { time } = event.payload;
        newState.world_time = time;
        break;
      }
    }
    return newState;
  };

  const updateStateFromAI = (jsonString: string) => {
    try {
      const proposal = JSON.parse(jsonString);
      
      setGameState((prev) => {
        let workingState = JSON.parse(JSON.stringify(prev));

        // 3. EVENT BUS
        if (proposal.events && Array.isArray(proposal.events)) {
          proposal.events.forEach((ev: any) => {
            workingState = applyGameEvent(workingState, ev);
          });
        }

        // 4. VALIDATION & SNAPSHOT SYNC
        const character = proposal.character || {};
        const newState: GameState = {
          ...workingState,
          character: {
            ...workingState.character,
            ...character,
            skills: character.skills || workingState.character.skills,
            inventory: character.inventory ? {
              equipment: character.inventory.equipment || workingState.character.inventory.equipment,
              items: character.inventory.items || workingState.character.inventory.items,
              materials: character.inventory.materials || workingState.character.inventory.materials,
            } : workingState.character.inventory,
            physical_details: {
              ...workingState.character.physical_details,
              ...(character.physical_details || {})
            }
          },
          lore_book: proposal.lore_book ? { ...workingState.lore_book, ...proposal.lore_book } : workingState.lore_book,
          lsr: { ...workingState.lsr, ...(proposal.lsr || {}) },
          world_events: (proposal.world_events || workingState.world_events).map((e: any) => 
            typeof e === 'string' ? e : (e && typeof e === 'object' ? (e.description || e.name || JSON.stringify(e)) : String(e))
          ),
          world_time: proposal.world_time || workingState.world_time,
          factions_dynamics: proposal.factions_dynamics || workingState.factions_dynamics,
          relationships: proposal.relationships || workingState.relationships
        };

        if (proposal.entity_memory) {
          const newNames = new Set(proposal.entity_memory.map((e: any) => e.name?.toLowerCase() || ''));
          const mergedMemory = proposal.entity_memory.map((newE: any) => {
            const existing = workingState.entity_memory.find((e: any) => (e.name?.toLowerCase() || '') === (newE.name?.toLowerCase() || ''));
            let finalE = { ...(existing || {}), ...newE };
            if (newE.events) {
              newE.events.forEach((ev: any) => {
                if (ev.type === "RELATION_CHANGE") {
                   const { loyalty, affection, desire } = ev.payload;
                   if (loyalty) finalE.loyalty = Math.min(100, Math.max(0, (finalE.loyalty || 0) + parseInt(loyalty)));
                   if (affection) finalE.affection = Math.min(100, Math.max(0, (finalE.affection || 0) + parseInt(affection)));
                   if (desire) finalE.desire = Math.min(100, Math.max(0, (finalE.desire || 0) + parseInt(desire)));
                }
              });
            }
            return finalE;
          });
          workingState.entity_memory.forEach((oldE: any) => {
            if (!newNames.has(oldE.name?.toLowerCase() || '')) {
              mergedMemory.push(oldE);
            }
          });
          newState.entity_memory = mergedMemory;
        }

        return newState;
      });
    } catch (e) {
      console.error("Absolute Client Error:", e);
    }
  };


  const resetGame = () => {
    setGameState(getDefaultGameState());
    setAiStatus(defaultAIStatus);
    // Clear page and scroll positions
    localStorage.removeItem('grok_current_page');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('grok_scroll_page_')) {
        localStorage.removeItem(key);
      }
    });
  };

  return (
    <GameContext.Provider value={{ gameState, setGameState, gameConfig, setGameConfig, aiConfig, setAiConfig, aiStatus, setAiStatus, updateStateFromAI, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
