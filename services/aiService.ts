import OpenAI from "openai";

const FALLBACK_TAUNTS = {
  BILLER: ["按秒计费", "加上税点", "咨询费结一下", "这算加班", "没钱免谈"],
  PEDANT: ["根据第X条", "逻辑不通", "格式错误", "定义不准", "有歧义"],
  STALLER: ["走流程", "还得研究", "等签字", "下周再说", "再议"],
  AGGRESSOR: ["起诉你！", "法庭见！", "后果自负", "发律师函", "绝不和解"]
};

export const generateLawyerTaunts = async (): Promise<Record<string, string[]>> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API Key provided, using fallback taunts.");
      return FALLBACK_TAUNTS;
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.siliconflow.cn/v1",
      dangerouslyAllowBrowser: true
    });

    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates JSON. Always respond with valid JSON only, no markdown formatting."
        },
        {
          role: "user",
          content: `Generate short, punchy Chinese phrases (max 5 chars) for 4 types of annoying lawyers.
      The tone should be exaggerated and funny.

      1. BILLER (Greedy): Obsessed with money. e.g. "得加钱", "计时中".
      2. PEDANT (Rule-obsessed): Uses obscure rules. e.g. "格式不对", "这里缺逗号".
      3. STALLER (Lazy): Delays everything. e.g. "还在走流程", "等领导签字".
      4. AGGRESSOR (Angry): Threatens litigation. e.g. "敢不给钱?", "马上起诉".

      Return JSON with exactly this format:
      {"BILLER": ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5"], "PEDANT": [...], "STALLER": [...], "AGGRESSOR": [...]}`
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    const jsonText = response.choices[0]?.message?.content;
    if (!jsonText) return FALLBACK_TAUNTS;

    // Clean up potential markdown formatting
    const cleanedJson = jsonText.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanedJson);

    return {
      BILLER: data.BILLER || FALLBACK_TAUNTS.BILLER,
      PEDANT: data.PEDANT || FALLBACK_TAUNTS.PEDANT,
      STALLER: data.STALLER || FALLBACK_TAUNTS.STALLER,
      AGGRESSOR: data.AGGRESSOR || FALLBACK_TAUNTS.AGGRESSOR,
    };

  } catch (error) {
    console.error("Failed to generate taunts:", error);
    return FALLBACK_TAUNTS;
  }
};
