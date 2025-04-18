import base64
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from loguru import logger
import os

class GeminiClient:
    def __init__(self):
        self.gemini_model = os.getenv("GEMINI_MODEL")
    
    def analyze_image(self, image_path):
        """Analyzes the image with Gemini AI and prints description"""
        try:
            with open(image_path, "rb") as img_file:
                base64_image = base64.b64encode(img_file.read()).decode("utf-8")

            gemini_model = ChatGoogleGenerativeAI(model=self.gemini_model, temperature=0.4)
            message = HumanMessage(
                content=[
                    {
                        "type": "text",
                        "text": "Describe the person: estimate their age, gender, and overall appearance. Give the output as a string in a single"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            )

            response = gemini_model.invoke([message])
            logger.info(f"📋 Gemini Description: {response.content}")
            return response.content
        except Exception as e:
            logger.info(f"❌ Error invoking Gemini AI: {e}")
