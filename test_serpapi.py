import os
from dotenv import load_dotenv
import serpapi

load_dotenv()

api_key = os.getenv("SERPAPI_API_KEY")

if not api_key:
    print("SerpApi API key not found.")
    exit()

client = serpapi.Client(api_key=api_key)

results = client.search({
    "engine": "google",
    "q": "Python Flask tutorial",
})

print("SerpApi connection successful!")
print()

for result in results.get("organic_results", [])[:3]:
    print("Title:", result.get("title"))
    print("Link:", result.get("link"))
    print()