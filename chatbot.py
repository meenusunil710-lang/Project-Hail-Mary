import ollama


def load_rocky_prompt():
    with open("prompts/rocky.txt", "r", encoding="utf-8") as file:
        return file.read()


def get_rocky_response(user_message):

    rocky_prompt = load_rocky_prompt()

    response = ollama.chat(
        model="qwen3:8b",
        messages=[
            {
                "role": "system",
                "content": rocky_prompt
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        options={
            "temperature": 0.5
        }
    )

    return response["message"]["content"]