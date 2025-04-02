import { appendDebugInfo } from './utils.js';

export async function getStoriesFromDeepSeek(destinations) {
    const deepSeekApiKey = "sk-6a06a4ce56df46b58b2fe659277f5487"; // 替换为你的 DeepSeek API 密钥
    const deepSeekApiUrl = "https://api.deepseek.com"; // 替换为 DeepSeek API 的基础 URL
    const destinationsWithStories = [];

    for (const destination of destinations) {
        try {
            const response = await fetch(deepSeekApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepSeekApiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-v1",
                    prompt: `请介绍一下景点 ${destination.name} 的故事`,
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (response.ok && data.result) {
                destination.story = data.result.trim();
            } else {
                destination.story = "暂无详细故事信息";
                appendDebugInfo(`DeepSeek API 返回错误: ${data.error || "未知错误"}`);
            }
            destinationsWithStories.push(destination);
        } catch (error) {
            console.error(`DeepSeek API 请求出错（景点：${destination.name}）:`, error);
            appendDebugInfo(`DeepSeek API 请求出错（景点：${destination.name}）: ${error}`);
            destination.story = "获取故事信息失败";
            destinationsWithStories.push(destination);
        }
    }

    return destinationsWithStories;
}
