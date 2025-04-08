import { getStoriesFromDeepSeek } from './kimi.js';

document.getElementById("testButton").addEventListener("click", async () => {
    const output = document.getElementById("output");
    output.textContent = "开始测试 DeepSeek AI API...\n";
    console.log("测试按钮点击事件触发");

    const testDestinations = [
        { name: "洪浪公园", location: "113.9629412,22.4627142", story: "" },
        { name: "深圳湾公园", location: "113.943000,22.512000", story: "" }
    ];

    try {
        console.log("调用 getStoriesFromDeepSeek 函数");
        const results = await getStoriesFromDeepSeek(testDestinations);
        console.log("getStoriesFromDeepSeek 返回结果:", results);
        output.textContent += "测试结果:\n";
        results.forEach(destination => {
            output.textContent += `景点: ${destination.name}\n`;
            output.textContent += `故事: ${destination.story}\n\n`;
        });
    } catch (error) {
        console.error("测试过程中发生错误:", error);
        output.textContent += `测试过程中发生错误:\n${error}\n`;
    }
});