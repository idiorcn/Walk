import { fetchDestinations } from './amap.js';
import { getStoriesFromDeepSeek } from './kimi.js';
import { appendDebugInfo, renderDestinations, addMarkers } from './utils.js';

export function initializeMap() {
    const map = new AMap.Map('map', {
        zoom: 15,
        center: [116.397428, 39.90923], // 默认中心点（北京天安门）
    });
    console.log("地图初始化完成");

    map.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 30000,
            GeoLocationFirst: true,
        });
        map.addControl(geolocation);
        geolocation.getCurrentPosition(async (status, result) => {
            if (status === 'complete') {
                const { lat, lng } = result.position;
                console.log(`当前位置：纬度=${lat}, 经度=${lng}`);
                map.setCenter([lng, lat]);
                appendDebugInfo(`当前位置：纬度=${lat}, 经度=${lng}`);
                const destinations = await fetchDestinations(lat, lng);
                if (destinations.length > 0) {
                    const destinationsWithStories = await getStoriesFromDeepSeek(destinations);
                    renderDestinations(destinationsWithStories);
                    addMarkers(destinationsWithStories, map);
                } else {
                    appendDebugInfo("未找到任何目的地");
                }
            } else {
                console.error("无法获取当前位置:", result.message);
                appendDebugInfo(`无法获取当前位置: ${result.message}`);
                useIpLocation(map);
            }
        });
    });
}

async function useIpLocation(map) {
    appendDebugInfo("尝试使用 IP 定位...");
    try {
        const response = await fetch('https://restapi.amap.com/v3/ip?key=45901b9e57f55f1065e5bf3c79a53500');
        const data = await response.json();
        if (data.status === '1' && data.rectangle) {
            const [lng, lat] = data.rectangle.split(';')[0].split(',').map(Number);
            console.log(`IP 定位成功：纬度=${lat}, 经度=${lng}`);
            appendDebugInfo(`IP 定位成功：纬度=${lat}, 经度=${lng}`);
            map.setCenter([lng, lat]);
            const destinations = await fetchDestinations(lat, lng);
            if (destinations.length > 0) {
                const destinationsWithStories = await getStoriesFromDeepSeek(destinations);
                renderDestinations(destinationsWithStories);
                addMarkers(destinationsWithStories, map);
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
