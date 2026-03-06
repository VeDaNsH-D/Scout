from google import genai
import os
from dotenv import load_dotenv

# Load API key
load_dotenv()
api_key = os.getenv("LLM_API_KEY")

# Initialize client
client = genai.Client(api_key=api_key)

print("\nFetching available models...\n")

try:
    models = client.models.list()

    for model in models:
        print(model.name)

except Exception as e:
    print("Error fetching models:", e)