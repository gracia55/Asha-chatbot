import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


OPENROUTER_API_KEY = "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"

class ChatbotAPIView(APIView):
    def post(self, request):
        user_message = request.data.get('message', '').lower()

        if not user_message:
            return Response({"reply": "Please provide a message."}, status=status.HTTP_400_BAD_REQUEST)

        try:
           
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct", 
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful chatbot that answers only women's awareness questions like rights, laws, safety, and helplines."
                        },
                        {
                            "role": "user",
                            "content": user_message
                        }
                    ]
                }
            )

           
            print("Raw Response:", response.status_code, response.text)

           
            data = response.json()

            if response.status_code != 200 or "choices" not in data:
                return Response(
                    {"reply": "Sorry, the AI service didn't return a proper response."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            reply = data["choices"][0]["message"]["content"]
            return Response({"reply": reply}, status=status.HTTP_200_OK)

        except Exception as e:
            print("OpenRouter API Error:", str(e))
            return Response(
                {"reply": "Sorry, something went wrong. Try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
