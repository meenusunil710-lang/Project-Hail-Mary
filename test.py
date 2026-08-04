import ollama

response = ollama.chat(
    model="qwen3:8b",
    think=False,
    messages=[
        {
            "role": "user",
            "content": "Hello!"
        }
    ]
)

print(response["message"]["content"])