import os
from typing import Dict, Any, List
from mistralai.client import MistralClient as Mistral
from dotenv import load_dotenv

load_dotenv()

class MistralClient:
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY", "GtJJSeLN4KB2ZSHRiFW4mPwjeIIOUfG2")
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY not found in environment variables")
        
        self.client = Mistral(api_key=self.api_key)
        self.model = "mistral-large-latest"
    
    async def generate_response(self, prompt: str, system_prompt: str = None, max_tokens: int = 2000) -> str:
        """Generate response using Mistral API"""
        try:
            messages = []
            
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            response = self.client.chat.complete(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"Error: {str(e)}"
    
    async def generate_json_response(self, prompt: str, system_prompt: str = None) -> Dict[str, Any]:
        """Generate JSON response using Mistral API"""
        try:
            full_prompt = f"{prompt}\n\nPlease respond with valid JSON only."
            response = await self.generate_response(full_prompt, system_prompt)
            
            # Try to extract JSON from response
            import json
            import re
            
            # Look for JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                # If no JSON found, try to parse the entire response
                return json.loads(response)
                
        except json.JSONDecodeError:
            # If JSON parsing fails, return a structured response
            return {
                "error": "Failed to parse JSON",
                "raw_response": response,
                "success": False
            }
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }