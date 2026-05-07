import { GoogleGenAI, Content } from "@google/genai";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { AIConfig, GameConfig } from "../contexts/GameContext";
import { sanitizeKey } from "./utils";

// We don't use initChatSession anymore since we pass full history to generateContentStream
export function initChatSession(aiConfig: AIConfig, gameConfig: GameConfig) {
  // No-op
}

export async function generateWorldAndCharacter(
  idea: string,
  aiConfig: AIConfig,
  gameConfig: GameConfig
): Promise<any> {
  const prompt = `Bạn là một chuyên gia thiết kế game RPG. Dựa trên ý tưởng (seed) sau của người chơi: "${idea}"
Hãy phân tích ý tưởng này và đề xuất Thể loại (Genre) và Văn phong (Style) phù hợp nhất từ danh sách sau.
Lưu ý quan trọng: BẠN CÓ THỂ KẾT HỢP NHIỀU THỂ LOẠI (ví dụ: "Tiên Hiệp, Hệ Thống, Xuyên Không") để tạo ra bối cảnh chính xác nhất.

- Thể loại gợi ý: [Tiên Hiệp, Kiếm Hiệp, Huyền Huyễn, Đông Phương, Đô Thị, Quan Trường, Trình Thám, Lịch Sử, Dị Giới, Khoa Huyễn, Mạt Thế, Võng Du, Ngôn Tình, Đam Mỹ, Bách Hợp, Cung Đấu, Hệ Thống, Linh Dị, Xuyên Không, Light Novel]
- Văn phong đề xuất (của các tác giả nổi tiếng như Kim Dung, Cổ Long, Nhĩ Căn, Vong Ngữ... hoặc Đời thường, Trực diện, Văn chương).

Trả về một chuỗi JSON hợp lệ theo format sau:
{
  "world": {
    "name": "Tên thế giới",
    "description": "Mô tả tổng quan",
    "history": "Lịch sử thế giới",
    "powerSystem": "Hệ thống sức mạnh",
    "factions": ["Thế lực 1: ...", "Thế lực 2: ..."],
    "locations": ["Địa điểm 1: ...", "Địa điểm 2: ..."],
    "laws": ["Quy tắc 1", "Quy tắc 2"]
  },
  "character": {
    "name": "Tên nhân vật",
    "age": "20",
    "gender": "Nam/Nữ...",
    "background": "Xuất thân",
    "appearance": "Ngoại hình tổng quan và vật lý chi tiết",
    "level": "Cấp độ/Tu vi ban đầu",
    "potential": "Tiềm năng / Căn cốt / Thiên tư",
    "reputation": "Danh vọng khởi đầu",
    "stats": "Tố chất/Thể chất/Thuộc tính",
    "skills": "Liệt kê các kỹ năng (cách nhau bởi dấu phẩy)",
    "inventory": "Liệt kê hành trang (cách nhau bởi dấu phẩy)",
    "personality": "Tính cách"
  },
  "suggestions": {
    "genre": "Kết hợp các thể loại chính xác từ danh sách (ví dụ: 'Khoa Huyễn, Mạt Thế')",
    "style": "Tên tác giả hoặc phong cách văn phong (Ví dụ: Kim Dung, Cổ Long, Trực diện...)"
  }
}
Lưu ý: TRẢ VỀ JSON HỢP LỆ, KHÔNG FORMAT THEO CÁCH NÀO KHÁC.`;

  let useProxy = !!(aiConfig.proxy1 && aiConfig.proxy1.url && aiConfig.proxy1.key);
  let apiKey = '';
  let baseUrl = undefined;

  if (useProxy) {
    apiKey = aiConfig.proxy1.key;
    baseUrl = aiConfig.proxy1.url;
  } else {
    // try to use user keys or default
    apiKey = aiConfig.apiKeys.length > 0 ? aiConfig.apiKeys[0] : (process.env.GEMINI_API_KEY || '');
  }

  // Sanitize key before use (remove BOM, etc.)
  apiKey = sanitizeKey(apiKey);

  // Validation for non-ISO-8859-1 characters in headers
  const hasInvalidHeaderChars = (s: string) => /[^\x00-\xFF]/.test(s);
  if (hasInvalidHeaderChars(apiKey)) {
    const invalidChars = Array.from(apiKey).filter(c => /[^\x00-\xFF]/.test(c)).join(', ');
    throw new Error(`API Key hoặc Password chứa ký tự không hợp lệ: ${invalidChars}. Vui lòng không dùng dấu tiếng Việt.`);
  }

  const ai = new GoogleGenAI({ 
    apiKey, 
    httpOptions: { 
      baseUrl: baseUrl || undefined,
      timeout: 60000
    } 
  });

  const response = await ai.models.generateContent({
    model: gameConfig.model, // use an appropriate fast model, or the same
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.9,
      tools: [{ googleSearch: {} }],
    }
  });

  if (response.text) {
    try {
      return JSON.parse(response.text);
    } catch(e) {
      console.error("Failed to parse JSON", e);
      throw new Error("Invalid format from AI");
    }
  }
  return null;
}

export async function summarizeHistory(
  messages: { role: 'user' | 'assistant', content: string }[],
  aiConfig: AIConfig,
  gameConfig?: GameConfig
): Promise<string | null> {
  let useProxy = !!(aiConfig.proxy1 && aiConfig.proxy1.url && aiConfig.proxy1.key);
  let apiKey = '';
  let baseUrl = undefined;

  if (useProxy) {
    apiKey = aiConfig.proxy1.key;
    baseUrl = aiConfig.proxy1.url;
  } else {
    if (aiConfig.apiKeys && aiConfig.apiKeys.length > 0) {
      apiKey = aiConfig.apiKeys[aiConfig.currentKeyIndex % aiConfig.apiKeys.length];
    } else {
      apiKey = process.env.GEMINI_API_KEY || '';
    }
  }

  if (!apiKey) {
    console.error("Summarize failure: No API Key found");
    return null;
  }

  // Sanitize
  apiKey = sanitizeKey(apiKey);

  const prompt = `Bạn là một biên tập viên xuất sắc. Dưới đây là các lượt đối thoại trong một trò chơi RPG. 
Hãy tóm tắt lại các diễn biến chính, các sự kiện quan trọng, các thay đổi về quan hệ nhân vật và trạng thái thế giới một cách súc tích (trong khoảng 100-200 từ).
Bản tóm tắt này sẽ được dùng làm "ký ức nền" cho AI để giải phóng bộ nhớ.

DỮ LIỆU CẦN TÓM TẮT:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content.substring(0, 1000)}...`).join('\n\n')}

HÃY TRẢ VỀ DUY NHẤT NỘI DUNG TÓM TẮT BẰNG TIẾNG VIỆT.`;

  try {
    const ai = new GoogleGenAI({ 
      apiKey, 
      httpOptions: { 
        baseUrl: baseUrl || undefined,
        timeout: 60000 
      } 
    });
    
    // Choose model: prefer gemini-3-flash-preview for consistency with the main engine
    const modelName = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model: modelName, 
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.3,
      }
    });
    return response.text || null;
  } catch (err) {
    console.error("Error summarizing history:", err);
    // Generic fallback
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.3 }
      });
      return response.text || null;
    } catch (err2) {
      return null;
    }
  }
}

export async function* sendMessageStream(
  messages: { role: 'user' | 'assistant', content: string }[],
  aiConfig: AIConfig,
  gameConfig: GameConfig,
  onStatusUpdate: (method: string, error?: string) => void,
  onKeyExhausted: () => void,
  summaries: string[] = []
) {
  const summaryContext = summaries.length > 0 
    ? `\n\n[DIỄN BIẾN CHÍNH ĐÃ QUA (TÓM TẮT)]\n${summaries.map((s, i) => `${i+1}. ${s}`).join('\n')}`
    : '';

  let useProxy1 = !!(aiConfig.proxy1 && aiConfig.proxy1.url && aiConfig.proxy1.key);
  let useProxy2 = !!(aiConfig.proxy2 && aiConfig.proxy2.url && aiConfig.proxy2.key);

  const dynamicPrompt1 = `${SYSTEM_PROMPT}${summaryContext}\n\n[CẤU HÌNH HIỆN TẠI]\n- Thể loại (Kết hợp): ${gameConfig.genre}\n- Văn phong tác giả: ${gameConfig.style}\n- Góc nhìn (Perspective): ${gameConfig.perspective} (Sử dụng cách xưng hô Tôi-Bạn-Hắn chính xác theo lựa chọn này)\n- Yêu cầu độ dài Tường thuật chính: Khoảng ${gameConfig.wordCount} từ (Không tính phần World Pulse và JSON). Hãy miêu tả cực kỳ chi tiết để đạt đủ số lượng từ này.${useProxy2 ? '\n\n[LƯU Ý DÀNH CHO PROXY 1]: BẠN SẼ CHỈ TẬP TRUNG VIẾT VĂN TƯỜNG THUẬT VÀ LOGIC HÀNH ĐỘNG. BỎ QUA YÊU CẦU TRẢ VỀ STATE_UPDATE JSON. TUYỆT ĐỐI KHÔNG TRẢ VỀ ===STATE_UPDATE===.' : ''}`;
  
  const dynamicPrompt2 = `${SYSTEM_PROMPT}${summaryContext}\n\n[CẤU HÌNH HIỆN TẠI]\n- Thể loại (Kết hợp): ${gameConfig.genre}\n- Văn phong tác giả: ${gameConfig.style}\n- Góc nhìn (Perspective): ${gameConfig.perspective}\n\n[LƯU Ý DÀNH CHO PROXY 2]: BẠN LÀ HỆ THỐNG XỬ LÝ BACKGROUND. DỰA VÀO HÀNH ĐỘNG CỦA NGƯỜI CHƠI VÀ BỐI CẢNH, BẠN CHỈ ĐƯỢC PHÉP TRẢ VỀ KHỐI ===STATE_UPDATE===...===END_STATE_UPDATE=== CHỨA TOÀN BỘ CẬP NHẬT JSON CỦA NHÂN VẬT VÀ LỊCH SỬ. KHÔNG ĐƯỢC PHÉP TRẢ VỀ BẤT KỲ ĐOẠN VĂN NÀO KHÁC.`;

  const contents: Content[] = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  
  let keyIndex = aiConfig.currentKeyIndex;
  
  // Launch Proxy 2 (Background Logic) in parallel if desired
  let proxy2Promise: Promise<string | null> | null = null;
  
  const bgApiKey = useProxy2 ? aiConfig.proxy2.key : (aiConfig.apiKeys.length > 0 ? aiConfig.apiKeys[keyIndex % aiConfig.apiKeys.length] : (process.env.GEMINI_API_KEY || ''));
  const bgBaseUrl = useProxy2 ? aiConfig.proxy2.url : undefined;
  const bgModel = useProxy2 && aiConfig.proxy2.model ? aiConfig.proxy2.model : gameConfig.model;
  
  // Safe execution of background proxy
  try {
    const bgAi = new GoogleGenAI({ 
      apiKey: sanitizeKey(bgApiKey), 
      httpOptions: { baseUrl: bgBaseUrl || undefined } 
    });
    proxy2Promise = bgAi.models.generateContent({
      model: bgModel,
      contents,
      config: {
        systemInstruction: dynamicPrompt2,
        temperature: 0.2, // low temp for JSON
      }
    }).then(res => res.text || null).catch(err => {
      console.error("Proxy 2 Logic Update failed:", err);
      return null;
    });
  } catch (err) {
    console.error("Proxy 2 Setup failed:", err);
    proxy2Promise = Promise.resolve(null);
  }

  let attempts = 0;
  const maxAttempts = useProxy1 ? aiConfig.apiKeys.length + 1 : Math.max(1, aiConfig.apiKeys.length);

  while (attempts < maxAttempts || attempts === 0) {
    let apiKey = '';
    let baseUrl = undefined;
    let currentMethod = '';
    let proxy1Model = gameConfig.model;

    if (useProxy1) {
      apiKey = aiConfig.proxy1.key;
      baseUrl = aiConfig.proxy1.url;
      proxy1Model = aiConfig.proxy1.model || gameConfig.model;
      currentMethod = `Proxy 1: ${baseUrl}`;
    } else {
      if (aiConfig.apiKeys.length === 0) {
        apiKey = process.env.GEMINI_API_KEY || '';
        currentMethod = `Default API Key`;
      } else {
        apiKey = aiConfig.apiKeys[keyIndex % aiConfig.apiKeys.length];
        currentMethod = `API Key: ...${apiKey.slice(-4)}`;
      }
    }

    onStatusUpdate(currentMethod + (useProxy2 ? ' + Proxy 2 Active' : ''));

    apiKey = sanitizeKey(apiKey);

    const hasInvalidHeaderChars = (s: string) => /[^\x00-\xFF]/.test(s);
    if (hasInvalidHeaderChars(apiKey)) {
      const invalidChars = Array.from(apiKey).filter(c => /[^\x00-\xFF]/.test(c)).map(c => `[${c}] (mã: ${c.charCodeAt(0)})`).join(', ');
      yield `\n\n**[LỖI HỆ THỐNG]** API Key hoặc Password Proxy chứa ký tự không hợp lệ: ${invalidChars}. Vui lòng kiểm tra lại.`;
      return;
    }

    if (gameConfig.responseMode === 'full') {
      try {
        const ai = new GoogleGenAI({ 
          apiKey, 
          httpOptions: { 
            baseUrl: baseUrl || undefined,
          } 
        });
        const response = await ai.models.generateContent({
          model: proxy1Model,
          contents,
          config: {
            systemInstruction: dynamicPrompt1,
            temperature: 0.8,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            tools: [{ googleSearch: {} }]
          }
        });
        
        if (response.text) {
          yield response.text;
          const bgState = await proxy2Promise;
          if (bgState) {
            const match = bgState.match(/===STATE_UPDATE===[\s\S]*?===END_STATE_UPDATE===/);
            if (match) {
              yield `\n\n${match[0]}`;
            } else {
              const jsonMatch = bgState.match(/```(?:json)?\n([\s\S]*?)\n```/);
              if (jsonMatch) yield `\n\n===STATE_UPDATE===\n${jsonMatch[1]}\n===END_STATE_UPDATE===`;
            }
          }
          return;
        }
        throw new Error("Không có phản hồi từ AI");
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        onStatusUpdate(currentMethod, errorMessage);
        
        if (useProxy1) {
          useProxy1 = false;
        } else {
          keyIndex++;
          onKeyExhausted();
        }
        attempts++;
        
        if (attempts >= maxAttempts && aiConfig.apiKeys.length > 0) {
          yield `\n\n**[LỖI HỆ THỐNG]** Đã thử tất cả kết nối Proxy 1 nhưng thất bại. Lỗi cuối: ${errorMessage}`;
          return;
        } else if (aiConfig.apiKeys.length === 0 && !useProxy1) {
          yield `\n\n**[LỖI HỆ THỐNG]** Lỗi kết nối Proxy 1: ${errorMessage}`;
          return;
        }
        continue;
      }
    }

    try {
      const ai = new GoogleGenAI({ 
        apiKey, 
        httpOptions: { 
          baseUrl: baseUrl || undefined,
        } 
      });
      
      const streamResponse = await ai.models.generateContentStream({
        model: proxy1Model,
        contents,
        config: {
          systemInstruction: dynamicPrompt1,
          temperature: 0.8,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          tools: [{ googleSearch: {} }]
        }
      });

      for await (const chunk of streamResponse) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
      
      // After Proxy 1 finishes streaming, we append Proxy 2's JSON state
      const bgState = await proxy2Promise;
      if (bgState) {
        const match = bgState.match(/===STATE_UPDATE===[\s\S]*?===END_STATE_UPDATE===/);
        if (match) {
          yield `\n\n${match[0]}`;
        } else {
          const jsonMatch = bgState.match(/```(?:json)?\n([\s\S]*?)\n```/);
          if (jsonMatch) yield `\n\n===STATE_UPDATE===\n${jsonMatch[1]}\n===END_STATE_UPDATE===`;
        }
      }
      return; // Success, exit the generator
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      onStatusUpdate(currentMethod, errorMessage);
      
      if (useProxy1) {
        useProxy1 = false; // Fallback to API keys
      } else {
        keyIndex++;
        onKeyExhausted(); // Update global index
      }
      attempts++;
      
      if (attempts >= maxAttempts && aiConfig.apiKeys.length > 0) {
        yield `\n\n**[LỖI HỆ THỐNG]** Đã thử tất cả kết nối Proxy 1 nhưng thất bại. Lỗi cuối: ${errorMessage}`;
        return;
      } else if (aiConfig.apiKeys.length === 0 && !useProxy1) {
        yield `\n\n**[LỖI HỆ THỐNG]** Lỗi kết nối Proxy 1: ${errorMessage}`;
        return;
      }
    }
  }
}

