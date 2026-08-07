import ollama
from conversation_manager import ConversationManager

manager = ConversationManager()

MAX_MESSAGES = 20

from prompts.build_prompt import load_prompt

ROCKY_PROMPT = load_prompt("rocky")

PRIMER = [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hello."},
    {"role": "user", "content": "Who are you?"},
    {"role": "assistant", "content": "Rocky. Eridian. Engineer."},
    {"role": "user", "content": "How are you?"},
    {"role": "assistant", "content": "Am good. Systems normal. What you need?"},
]


def get_rocky_response(user_message, conversation_id):

    conversation = manager.load(conversation_id)
    conversation = conversation[-MAX_MESSAGES:]

    messages = [
        {
            "role": "system",
            "content": ROCKY_PROMPT
        }
    ]

    messages.extend(PRIMER)
    messages.extend(conversation)

    messages.append(
        {
            "role": "user",
            "content": user_message
        }
    )

    response = ollama.chat(
        model="gemma3:4b",
        think=False,
        messages=messages,
        options={
            "temperature": 0.6,
            "num_predict": 150,
            "repeat_penalty": 1.15,
            "top_k": 40,
            "top_p": 0.9
        }
    )

    reply = response["message"]["content"]

    manager.append(
        conversation_id,
        "user",
        user_message
    )

    manager.append(
        conversation_id,
        "assistant",
        reply
    )

    return reply