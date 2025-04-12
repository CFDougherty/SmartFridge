# POC in Python - to be translated to JS later

import requests
import traceback
import json


GPT_API_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_API_KEY = "loaded from env"


def main():
    try:
        #Test data
        ingredients = "Milk, lettuce, butter, ground beef, tortillas, tofu, eggs, sour cream"
        restrictions = "None"
        meal_type = "Lunch"
        preferences = "cooks under 30 minutes"

        
        
        # Prepare statement
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a chef assistant. Given a list of available ingredients and dietary restrictions, "
                        "respond in JSON format with exactly 3 possible recipes. "
                        "If nothing can be made with what's on-hand, then offer simple recipes that use some or all of the provided ingredients. "
                        "The ingredients will be provided in order of weighted priority, with the first being the highest priority to use, and the last being the least priority. "
                        "Each recipe should include 'title', 'ingredients', 'cook time', and 'instructions'. "
                        "Any ingredients not in the provided list but required for the recipe (e.g. taco shells) must still be included in the ingredient list."
                        "All ingredients should include quantities"
                        "The instructions should each be separate string values in a list."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"My ingredients are: {ingredients}.\n"
                        f"My dietary restrictions are: {restrictions}.\n"
                        f"The meal is for: {meal_type}.\n"
                        f"I want something that meets the following criteria: {preferences}.\n"
                        "Please suggest 3 recipes I can make."
                    )
                }
            ],
            # Needed to up limit from 700. Roughtly $0.005/req
            "max_tokens": 1000
        }
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Send request
        print("Sending request to model...")
        gpt_response = requests.post(GPT_API_URL, json=payload, headers=headers)
        
        if gpt_response.status_code != 200:
            print(f"OpenAI API Error: {gpt_response.status_code}, {gpt_response.text}")
            return
        
        recipes = gpt_response.json()["choices"][0]["message"]["content"]
        # We already have stripping for converting to JSON in main code, yeah?
        print(recipes)

    except Exception as e:
        print("Exception:", traceback.format_exc())

if __name__ == '__main__':
    main()
