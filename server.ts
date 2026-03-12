import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Default to production if not specified
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/models", async (req, res) => {
    try {
      const { apiKey, baseUrl } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "请提供API Key" });
      }

      const apiUrl = baseUrl || "https://api.openai.com/v1";
      
      const response = await fetch(`${apiUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        return res.status(response.status).json({ error: "获取模型列表失败", details: errorData });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Fetch models error:", error);
      res.status(500).json({ error: "服务器内部错误" });
    }
  });

  app.post("/api/generate-schedule", async (req, res) => {
    try {
      const { age, gender, allergies, cookingMethod, days, healthCondition, apiConfig } = req.body;

      const apiKey = apiConfig?.apiKey || process.env.OPENAI_API_KEY;
      const baseUrl = apiConfig?.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      const model = apiConfig?.model || process.env.OPENAI_MODEL || "gpt-3.5-turbo";

      if (!apiKey) {
        return res.status(400).json({ error: "未配置API Key，请在设置中配置" });
      }

      const prompt = `
你是一个专业的婴幼儿营养师。请根据以下信息，为宝宝制定一份详细的辅食时间表：
- 月龄：${age}个月
- 性别：${gender}
- 身体状态：${healthCondition || "健康"}
- 严格规避的过敏原/食材：${allergies || "无"}
- 烹饪方式偏好：${cookingMethod || "不限"}
- 食谱天数：${days}天

要求：
1. 包含每天的早、中、晚三餐。
2. 判断该月龄是否需要加餐，如果需要，请将加餐与正餐合并在一起，并严格按照时间先后顺序排列。
3. 给出每天推荐的奶量和喝奶时间。
4. 每餐的做法、用量都要有详细说明。特别是针对宝宝当前的身体状态（如肠胃弱、拉肚子等），在食材选择和做法上给出针对性调整。
5. 增加每天的辅食总结（summary），说明当天辅食安排的寓意、营养重点和吃法建议。
6. 必须严格排除用户指定的过敏原/食材（${allergies || "无"}），绝对不能出现在食谱中。
7. 请以JSON格式返回结果，格式如下：
{
  "babyInfo": "宝宝基本情况总结，包含对当前身体状态的分析",
  "dailyMilk": "每日奶量推荐及时间安排",
  "schedule": [
    {
      "day": 1,
      "summary": "今天的辅食安排寓意、营养重点及吃法建议总结",
      "nutritionEstimates": {
        "protein": "蛋白质预估值(仅数值，单位为g)",
        "iron": "铁预估值(仅数值，单位为mg)",
        "calcium": "钙预估值(仅数值，单位为mg)"
      },
      "meals": [
        { "type": "早餐", "time": "08:00", "food": "食物名称", "amount": "用量", "recipe": "做法说明" },
        { "type": "加餐", "time": "10:00", "food": "食物名称", "amount": "用量", "recipe": "做法说明" },
        { "type": "午餐", "time": "12:00", "food": "食物名称", "amount": "用量", "recipe": "做法说明" },
        { "type": "晚餐", "time": "18:00", "food": "食物名称", "amount": "用量", "recipe": "做法说明" }
      ]
    }
  ]
}
注意：
1. 请严格按照JSON格式输出，不要包含任何其他说明文字。
2. meals数组中的内容必须按照time时间先后顺序排列。
3. 在制定食谱时，请充分考虑食材的季节性与可获得性，优先推荐当季新鲜食材。
`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "你是一个专业的婴幼儿营养师，只输出符合要求的JSON格式数据。" },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("OpenAI API Error:", errorData);
        return res.status(response.status).json({ error: "API请求失败", details: errorData });
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedContent = JSON.parse(content);
        res.json(parsedContent);
      } catch (e) {
        console.error("Failed to parse JSON:", content);
        res.status(500).json({ error: "解析AI返回结果失败" });
      }

    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "服务器内部错误" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
