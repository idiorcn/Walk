import { Configuration, OpenAIApi } from "openai";
document.addEventListener("DOMContentLoaded", () => {
    
    const destinationList = document.getElementById("destination-list");
    const debugOutput = document.getElementById("debug-output");

    // 初始化高德地图
    const map = new AMap.Map('map', {
        zoom: 15,
        center: [116.397428, 39.90923], // 默认中心点（北京天安门）
    });
    console.log("地图初始化完成");

    // 获取当前位置
    map.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 30000, // 增加超时时间到 30 秒
            GeoLocationFirst: true, // 优先使用浏览器定位
        });
        map.addControl(geolocation);
        geolocation.getCurrentPosition(async (status, result) => {
            if (status === 'complete') {
                const { lat, lng } = result.position;
                console.log(`当前位置：纬度=${lat}, 经度=${lng}`);
                map.setCenter([lng, lat]); // 设置地图中心为当前位置
                appendDebugInfo(`当前位置：纬度=${lat}, 经度=${lng}`);
                const destinations = await fetchDestinations(lat, lng);
                if (destinations.length > 0) {
                    const destinationsWithStories = await getStoriesFromKimi(destinations);
                    renderDestinations(destinationsWithStories);
                    addMarkers(destinationsWithStories, map);
                    appendDebugInfo("附近的景点列表：");
                    destinationsWithStories.forEach(destination => {
                        appendDebugInfo(`- ${destination.name} (地址: ${destination.story}, 位置: ${destination.location})`);
                    });
                } else {
                    console.warn("未找到任何目的地");
                    appendDebugInfo("未找到任何目的地");
                }
            } else {
                console.error("无法获取当前位置:", result.message);
                appendDebugInfo(`无法获取当前位置: ${result.message}`);
                // 使用 IP 定位作为备用
                useIpLocation();
            }
        });
    });

    // 使用高德 IP 定位作为备用
    async function useIpLocation() {
        appendDebugInfo("尝试使用 IP 定位...");
        try {
            const response = await fetch('https://restapi.amap.com/v3/ip?key=45901b9e57f55f1065e5bf3c79a53500');
            const data = await response.json();
            if (data.status === '1' && data.rectangle) {
                const [lng, lat] = data.rectangle.split(';')[0].split(',').map(Number);
                console.log(`IP 定位成功：纬度=${lat}, 经度=${lng}`);
                appendDebugInfo(`IP 定位成功：纬度=${lat}, 经度=${lng}`);
                map.setCenter([lng, lat]); // 设置地图中心为 IP 定位位置
                const destinations = await fetchDestinations(lat, lng);
                if (destinations.length > 0) {
                    const destinationsWithStories = await getStoriesFromKimi(destinations);
                    renderDestinations(destinationsWithStories);
                    addMarkers(destinationsWithStories, map);
                    appendDebugInfo("附近的景点列表：");
                    destinationsWithStories.forEach(destination => {
                        appendDebugInfo(`- ${destination.name} (地址: ${destination.story}, 位置: ${destination.location})`);
                    });
                } else {
                    appendDebugInfo("未找到任何目的地");
                }
            } else {
                console.error("IP 定位失败:", data.info);
                appendDebugInfo(`IP 定位失败: ${data.info}`);
            }
        } catch (error) {
            console.error("IP 定位请求出错:", error);
            appendDebugInfo(`IP 定位请求出错: ${error}`);
        }
    }

    // 调用高德 API 获取附近的目的地
    async function fetchDestinations(lat, lng) {
        const amapApiKey = "45901b9e57f55f1065e5bf3c79a53500";
        const url = `https://restapi.amap.com/v3/place/around`;
        const params = new URLSearchParams({
            key: amapApiKey,
            location: `${lng},${lat}`, // 经度在前，纬度在后
            radius: "5000", // 增加搜索半径到 5000 米
            types: "风景名胜", // 调整兴趣点类型为 "风景名胜"
            output: "JSON",
        });

        console.log("请求高德 API:", `${url}?${params.toString()}`);
        appendDebugInfo(`请求高德 API: ${url}?${params.toString()}`);
        try {
            const response = await fetch(`${url}?${params.toString()}`);
            const data = await response.json();
            console.log("高德 API 返回数据:", data);
            appendDebugInfo(`高德 API 返回数据: ${JSON.stringify(data, null, 2)}`);
            if (data.status === '1' && data.pois) {
                return data.pois.map(poi => ({
                    name: poi.name,
                    story: poi.address || "暂无详细信息",
                    location: poi.location,
                }));
            } else {
                console.error("高德 API 请求失败:", data.info);
                appendDebugInfo(`高德 API 请求失败: ${data.info}`);
                return [];
            }
        } catch (error) {
            console.error("高德 API 请求出错:", error);
            appendDebugInfo(`高德 API 请求出错: ${error}`);
            return [];
        }
    }

    
    // 调用 Kimi AI API 获取景点故事
    async function getStoriesFromKimi(destinations) {
        const kimiApiKey = "sk-Nzfn1apmBjTjoQIxrdH1CpcMOAWtuDrb0HsHRAfYEXnX5LLe"; // 替换为你的 Kimi API 密钥
        const configuration = new Configuration({
            apiKey: kimiApiKey,
            baseURL: "https://api.moonshot.cn/v1" // 设置 Kimi API 基础 URL
        });
        
        const openai = new OpenAIApi(configuration);
        const destinationsWithStories = [];
    
        for (const destination of destinations) {
            try {
                const response = await openai.createChatCompletion({
                    model: "moonshot-v1-8k",
                    messages: [
                        {
                            role: "system",
                            content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。"
                        },
                        {
                            role: "user",
                            content: `请介绍一下景点 ${destination.name} 的故事`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 500,
                    n: 1,
                    stop: ["###"]
                });
    
                destination.story = response.data.choices[0].message.content.trim();
                destinationsWithStories.push(destination);
            } catch (error) {
                console.error(`Kimi AI API 请求出错（景点：${destination.name}）:`, error);
                destination.story = "获取故事信息失败";
                destinationsWithStories.push(destination);
            }
        }
    
        return destinationsWithStories;
    }
    // 渲染目的地列表
    function renderDestinations(destinations) {
        console.log("渲染目的地列表:", destinations);
        destinationList.innerHTML = "";
        destinations.forEach((destination) => {
            const li = document.createElement("li");
            li.textContent = destination.name;
            li.addEventListener("click", () => {
                speak(destination.story);
            });
            destinationList.appendChild(li);
        });
    }

    // 在地图上添加标记
    function addMarkers(destinations, map) {
        console.log("添加标记到地图:", destinations);
        destinations.forEach(destination => {
            const [lng, lat] = destination.location.split(',').map(Number);
            const marker = new AMap.Marker({
                position: new AMap.LngLat(lng, lat),
                title: destination.name,
            });
            marker.setMap(map);
        });
    }

    // 使用 Web Speech API 播报文字
    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }

    // 追加调试信息到页面
    function appendDebugInfo(message) {
        debugOutput.textContent += `${message}\n`;
    }
});    