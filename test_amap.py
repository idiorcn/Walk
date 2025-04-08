import requests

def fetch_nearby_places(lat, lng, radius=1000, types="旅游景点", amap_api_key="45901b9e57f55f1065e5bf3c79a53500"):
    """
    调用高德 API 获取附近的景点信息
    """
    url = f"https://restapi.amap.com/v3/place/around"
    params = {
        "key": amap_api_key,
        "location": f"{lng},{lat}",  # 经度在前，纬度在后
        "radius": radius,
        "types": types,
        "output": "JSON"
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "1" and "pois" in data:
            return data["pois"]
        else:
            print(f"高德 API 请求失败: {data.get('info')}")
            return []
    except requests.RequestException as e:
        print(f"请求出错: {e}")
        return []

def main():
    # 测试经纬度（例如：北京天安门）
    lat, lng = 39.90923, 116.397428
    print(f"测试位置: 纬度={lat}, 经度={lng}")
    
    # 调用高德 API
    places = fetch_nearby_places(lat, lng)
    
    # 打印结果
    if places:
        print("附近的景点列表:")
        for place in places:
            name = place.get("name", "未知景点")
            address = place.get("address", "暂无地址")
            location = place.get("location", "未知位置")
            print(f"- {name} (地址: {address}, 位置: {location})")
    else:
        print("未找到任何景点信息。")

if __name__ == "__main__":
    main()
