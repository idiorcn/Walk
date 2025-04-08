import requests

def get_story_from_kimi(place_name, kimi_api_key="sk-Nzfn1apmBjTjoQIxrdH1CpcMOAWtuDrb0HsHRAfYEXnX5LLe"):
    """
    调用 Kimi AI API 获取指定地点的故事
    """
    kimi_api_url = "https://api.moonshot.cn/v1"  # 替换为实际的 Kimi AI API URL
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {kimi_api_key}"
    }
    payload = {
        "input": f"请介绍一下景点 {place_name} 的故事"
    }

    try:
        response = requests.post(kimi_api_url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("result", "暂无详细故事信息")
    except requests.RequestException as e:
        print(f"Kimi AI API 请求出错: {e}")
        return "获取故事信息失败"

def main():
    place_name = "洪浪公园"
    print(f"测试地点: {place_name}")
    
    # 调用 Kimi AI API 获取故事
    story = get_story_from_kimi(place_name)
    
    # 打印结果
    print(f"故事: {story}")

if __name__ == "__main__":
    main()
