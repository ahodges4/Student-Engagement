import json
import os
import openai
from dotenv import load_dotenv
import requests


class ChatGPT3:
    def __init__(self):
        load_dotenv()
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        self.questionPromt = 'Generate multiple choice questions about the following text, with four options. The question should be of moderate difficulty and test the knowledge of the person who has to answer them. Please return the MCQs in the JSON format {"questions": [ {"id" : <id>, "question_statement": "", "answer": "", "options": [], "context": ""} ] } Where "id" should be a iterative number starting from one, "questions" is an array of JSON objects, "question_statement" is the question to be answered, "answer" is the correct answer, "options" is an array of incorrect answers to the question which should not include the correct answer and "context" is an in-depth easy to understand explaination of the answer from the text as well as an explaination using your own knowledge. Do not include "The text explains that" or similar at the start of the context.'
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai.api_key}",
        }
        self.url = "https://api.openai.com/v1/chat/completions"
        self.model = "gpt-3.5-turbo"
        self.temperature = 0.5

    def getResponse(self, text):

        promt = self.questionPromt + " \n Text: " + text

        payload = {
            "model": self.model,
            "temperature": self.temperature,
            "messages": [{"role": "user", "content": promt}]
        }

        response = requests.post(
            self.url, headers=self.headers, data=json.dumps(payload))

        response_data = response.json()

        content = response_data["choices"][0]["message"]["content"]
        print(response_data)

        return content
