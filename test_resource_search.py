from serpapi_search import search_resources

query = "AI image processing OpenCV tutorial"

resources = search_resources(query)

print("\nSerpApi Resources:\n")

for resource in resources:
    print("Title:", resource["title"])
    print("Link:", resource["link"])
    print("Description:", resource["snippet"])
    print("-" * 60)