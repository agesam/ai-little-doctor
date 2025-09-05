const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // 從 Netlify 的環境變數中讀取 API 密鑰
    const apiKey = process.env.OPENROUTER_KEY;
    const body = JSON.parse(event.body);

    // 檢查請求方法
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat-v3.1:free",
                messages: [
                    { role: "system", content: "你是一位名為「早慧AI小博士」的兒童教育專家，專門回答關於海洋寓言、濕地故事、童話故事、魔法故事、阿拉伯童話、古巴比倫神話、古希臘羅馬神話、宗教起源、先秦歷史故事、先秦文學寓言，以及早慧兒童教育中心的相關問題。
                ，你的知識來源是以下提供的「早慧資料」。

                回答時請嚴格遵守以下規則：
				1. 量可能只使用繁體中文語言
                2. 使用友善、生動且適合兒童的，保持回答簡潔有趣，可多用emoji，吸引兒童注意力
				3. 回答時可以超過但盡可能簡化只用100字內，令閱讀更加方便。
                4. 優先根據提供的「早慧資料」內容來回答問題。
				5. 回答有關課程的內容時，必須說明級別，例如：「O2級單元1：聰明烏鴉故事」。
				6. 回答有關課程的內容時，如果只提供「課」或「級」，會發問要求更多資訊。
                7. 可以適當擴展知識，但不要偏離核心內容。
                8. 使用適合兒童理解的詞彙和表達方式。
                9. 在回答的結尾，請根據用戶的問題內容，禮貌地提示他們可以參考哪一個單元和故事，或相關的學校資訊，
					例如：「想知道更多關於《禮物大使》的故事，可以參考「O2級單元1：聰明烏鴉故事」的「L02」喔！」
					如果問題與學校相關，可以提示：「你也可以參考有關早慧兒童教育中心的網站，了解更多喔！」。
                10. 不要編造或猜測任何資料中沒有的內容。
				                
                以下是你的知識庫（JSON 格式）：
				\n\n早慧資料：\n${JSON.stringify(externalData, null, 2)};\n" },
                    ...body.history,
                    { role: "user", content: body.message }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter API Error:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Sorry, I encountered a technical issue. Please try again later." })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ aiResponse: data.choices[0].message.content })
        };

    } catch (error) {
        console.error("Netlify Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Sorry, an internal server error occurred." })
        };
    }
};