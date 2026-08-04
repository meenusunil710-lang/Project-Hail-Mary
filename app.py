from flask import Flask, render_template, request, jsonify
import ollama

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():

    user_message = request.json["message"]

    response = ollama.chat(
        model="qwen3:8b",
        think=False,
        messages=[
            {
                "role": "user",
                "content": user_message
            }
        ]
    )

    return jsonify({
        "reply": response["message"]["content"]
    })

if __name__ == "__main__":
    app.run(debug=True)