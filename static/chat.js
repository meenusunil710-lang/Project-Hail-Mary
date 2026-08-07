// ── NASApunk Mission Control Interface ──────────────

let currentConversation = null;

const CALLSIGNS = [
    "HOUSTON", "CAPCOM", "FLIGHT", "EECOM",
    "GNC", "FIDO", "RETRO", "GUIDO", "TELMU"
];

function getMissionTimestamp() {
    const now = new Date();
    const doy = Math.floor(
        (now - new Date(now.getFullYear(), 0, 0)) / 86400000
    );
    return `MET ${String(doy).padStart(3, '0')}:${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function getCallsign() {
    return CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)];
}

function sanitize(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ── Load Conversation List ──────────────────────────

async function loadConversationList() {

    let response = await fetch("/conversations");
    let data = await response.json();
    let list = document.getElementById("conversation-list");

    list.innerHTML = "";

    data.conversations.forEach((conversation, i) => {
        const callsign = CALLSIGNS[i % CALLSIGNS.length];
        const isActive = conversation === currentConversation ? ' active' : '';

        list.innerHTML += `
        <div class="conversation-item${isActive}">
            <button
                class="conversation-button"
                onclick="switchConversation('${conversation}')">
                <span class="conv-callsign">${callsign}</span>
                <span class="conv-id">${conversation}</span>
            </button>
            <button
                class="delete-button"
                onclick="deleteConversation('${conversation}')"
                title="TERMINATE LOG">
                ✕
            </button>
        </div>
        `;
    });
}

// ── Switch Conversation ─────────────────────────────

async function switchConversation(conversationId) {

    currentConversation = conversationId;

    loadConversationList();

    let chat = document.getElementById("chat");
    chat.innerHTML = `
        <div class="system-status">
            ▶ RETRIEVING TRANSMISSION LOG: ${sanitize(conversationId)}...
        </div>
    `;

    let response = await fetch(`/conversation/${conversationId}`);
    let data = await response.json();

    chat.innerHTML = "";

    for (let message of data.messages) {
        const timestamp = getMissionTimestamp();

        if (message.role === "user") {
            chat.innerHTML += `
                <div class="message user">
                    <div class="msg-meta">TRANSMIT ▷ ${timestamp}</div>
                    <div class="msg-body">${message.content}</div>
                </div>
            `;
        } else {
            chat.innerHTML += `
                <div class="message rocky">
                    <div class="msg-meta">◁ ${getCallsign()} · ${timestamp}</div>
                    <div class="msg-body">${message.content}</div>
                </div>
            `;
        }
    }

    chat.scrollTop = chat.scrollHeight;
}

// ── New Chat ────────────────────────────────────────

async function newChat() {

    try {
        let response = await fetch("/new_chat", { method: "POST" });
        let data = await response.json();

        currentConversation = data.conversation_id;
        loadConversationList();

        document.getElementById("chat").innerHTML = `
            <div class="system-status">
                ◆ UPLINK ESTABLISHED — CHANNEL ${sanitize(data.conversation_id)}
                <br>
                <span class="status-sub">${getMissionTimestamp()} · ALL SYSTEMS NOMINAL</span>
            </div>
        `;
    } catch (error) {
        showSystemAlert("UPLINK FAILURE — COULD NOT ESTABLISH NEW CHANNEL");
    }
}

// ── Delete Conversation ─────────────────────────────

async function deleteConversation(conversationId) {

    if (!confirm("⚠ CONFIRM: PURGE TRANSMISSION LOG?\nThis action is irreversible.")) {
        return;
    }

    try {
        await fetch("/delete_chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation_id: conversationId })
        });

        loadConversationList();

        if (currentConversation === conversationId) {
            document.getElementById("chat").innerHTML = `
                <div class="system-status warning">
                    ▲ LOG PURGED — ${sanitize(conversationId)}
                    <br>
                    <span class="status-sub">${getMissionTimestamp()}</span>
                </div>
            `;
        }
    } catch {
        showSystemAlert("PURGE FAILED — TRANSMISSION LOG LOCKED");
    }
}

// ── Send Message ────────────────────────────────────

async function sendMessage() {

    let input = document.getElementById("message");
    let chat = document.getElementById("chat");
    let message = input.value.trim();

    if (message === "") return;

    const timestamp = getMissionTimestamp();

    chat.innerHTML += `
        <div class="message user">
            <div class="msg-meta">TRANSMIT ▷ ${timestamp}</div>
            <div class="msg-body">${sanitize(message)}</div>
        </div>
    `;

    input.value = "";

    chat.innerHTML += `
        <div class="message rocky uplink-pending" id="loading">
            <div class="msg-meta">◁ AWAITING RESPONSE</div>
            <div class="msg-body">
                <span class="uplink-anim">ESTABLISHING UPLINK</span><span class="uplink-dots"></span>
            </div>
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

    try {
        let response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                conversation_id: currentConversation
            })
        });

        let data = await response.json();

        document.getElementById("loading").remove();

        const replyTimestamp = getMissionTimestamp();
        const callsign = getCallsign();

        chat.innerHTML += `
            <div class="message rocky">
                <div class="msg-meta">◁ ${callsign} · ${replyTimestamp}</div>
                <div class="msg-body">${data.reply}</div>
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

    } catch (error) {

        document.getElementById("loading").remove();

        chat.innerHTML += `
            <div class="message rocky error-msg">
                <div class="msg-meta">◁ SIGNAL LOST</div>
                <div class="msg-body">
                    ⚠ TRANSMISSION ERROR — ${sanitize(String(error))}
                    <br><span class="status-sub">RETRY UPLINK OR CHECK GROUND CONTROL</span>
                </div>
            </div>
        `;
    }
}

// ── System Alert ────────────────────────────────────

function showSystemAlert(text) {
    let chat = document.getElementById("chat");
    chat.innerHTML += `
        <div class="system-status warning">
            ▲ ${text}
            <br>
            <span class="status-sub">${getMissionTimestamp()}</span>
        </div>
    `;
}

// ── Enter to Send ───────────────────────────────────

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        const input = document.getElementById("message");
        if (document.activeElement === input) {
            e.preventDefault();
            sendMessage();
        }
    }
});

// ── Initialize ──────────────────────────────────────

async function init() {
    let response = await fetch("/conversations");
    let data = await response.json();

    if (data.conversations.length === 0) {
        await newChat();
    } else {
        currentConversation = data.conversations[data.conversations.length - 1];
        await loadConversationList();
        await switchConversation(currentConversation);
    }
}

init();