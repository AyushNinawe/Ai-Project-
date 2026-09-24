import os
from typing import Optional, Dict, Any

class GeminiService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.default_model = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-3.8-flash")
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize google-genai: {e}")

    def generate(self, prompt: str, system_instruction: Optional[str] = None, model: Optional[str] = None, temperature: float = 0.3) -> Dict[str, Any]:
        target_model = model or self.default_model
        if self.client:
            candidate_models = [target_model]
            if target_model != "gemini-3.6-flash":
                candidate_models.append("gemini-3.6-flash")
            if target_model != "gemini-3.8-flash":
                candidate_models.append("gemini-3.8-flash")

            for curr_model in candidate_models:
                try:
                    config = {"temperature": temperature}
                    if system_instruction:
                        config["system_instruction"] = system_instruction
                    
                    response = self.client.models.generate_content(
                        model=curr_model,
                        contents=prompt,
                        config=config
                    )
                    if response and response.text:
                        return {
                            "text": response.text,
                            "model_used": curr_model,
                            "is_real_ai": True
                        }
                except Exception as e:
                    # Cascade to next model if temporary demand spike or unavailable
                    continue

        # Fallback simulation
        return {
            "text": f"Simulated output from {target_model}: Successfully processed input prompt with internal AI execution engine.",
            "model_used": f"{target_model} (Fallback)",
            "is_real_ai": False
        }

gemini_service = GeminiService()
