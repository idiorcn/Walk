import { appendDebugInfo } from './utils.js';

export async function fetchDestinations(lat, lng) {
    const amapApiKey = "45901b9e57f55f1065e5bf3c79a53500"; // 替换为你的高德 API 密钥
    const url = `https://restapi.amap.com/v3/place/around`;
    const params = new URLSearchParams({
        key: amapApiKey,
        location: `${lng},${lat}`,
        radius: "5000",
        types: "风景名胜",
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
            appendDebugInfo(`高德 API 请求失败: ${data.info}`);
            return [];
        }
    } catch (error) {
        appendDebugInfo(`高德 API 请求出错: ${error}`);
        return [];
    }
}
