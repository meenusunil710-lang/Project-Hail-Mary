from flask import Flask, render_template, request, jsonify
from chatbot import get_rocky_response
from conversation_manager import ConversationManager

manager = ConversationManager()
app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()
    user_message = data["message"]
    conversation_id = data["conversation_id"]

    reply = get_rocky_response(
        user_message,
        conversation_id)

    return jsonify({
        "reply": reply
    })
@app.route("/new_chat", methods=["POST"])
def new_chat():

    conversation_id = manager.new_conversation()

    return jsonify({
        "conversation_id": conversation_id
    })
@app.route("/conversations")
def conversations():

    return jsonify({
        "conversations": manager.list_conversations()
    })
@app.route("/conversation/<conversation_id>")
def get_conversation(conversation_id):

    messages = manager.load(conversation_id)

    return jsonify({
        "messages": messages
    })
@app.route("/delete_chat", methods=["POST"])
def delete_chat():

    data = request.get_json()

    conversation_id = data["conversation_id"]

    manager.delete(conversation_id)

    return jsonify({
        "success": True
    })
if __name__ == "__main__":
    app.run(debug=True)