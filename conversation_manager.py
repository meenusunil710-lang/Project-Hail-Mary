import json
import os

CONVERSATION_DIR = "conversations"


class ConversationManager:

    def __init__(self):
        self.folder = CONVERSATION_DIR
        os.makedirs(self.folder, exist_ok=True)

    def conversation_path(self, conversation_id):
        return os.path.join(
            CONVERSATION_DIR,
            f"{conversation_id}.json"
        )

    def load(self, conversation_id):
        path = self.conversation_path(conversation_id)

        if not os.path.exists(path):
            return []

        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)

    def save(self, conversation_id, messages):
        path = self.conversation_path(conversation_id)

        with open(path, "w", encoding="utf-8") as file:
            json.dump(
                messages,
                file,
                indent=2,
                ensure_ascii=False
            )

    def append(self, conversation_id, role, content):
        messages = self.load(conversation_id)

        messages.append({
            "role": role,
            "content": content
        })

        self.save(conversation_id, messages)

    def create(self, conversation_id):
        path = self.conversation_path(conversation_id)

        if not os.path.exists(path):
            self.save(conversation_id, [])

    def list_conversations(self):
        files = []

        for filename in os.listdir(CONVERSATION_DIR):
            if filename.endswith(".json"):
                files.append(filename[:-5])

        files.sort()
        return files

    def new_conversation(self):
        conversations = self.list_conversations()

        # Find the highest existing number to avoid ID collisions after deletes
        max_number = 0
        for conv in conversations:
            try:
                num = int(conv.split("_")[-1])
                if num > max_number:
                    max_number = num
            except ValueError:
                pass

        number = max_number + 1
        conversation_id = f"conversation_{number:03d}"

        self.create(conversation_id)

        return conversation_id

    def delete(self, conversation_id):
        filename = os.path.join(
            self.folder,
            f"{conversation_id}.json"
        )

        if os.path.exists(filename):
            os.remove(filename)