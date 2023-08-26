// DOM element references
const chatbotToggler = document.querySelector(".chatbot-toggler button");
const chabotTooltip = document.querySelector(".chatbot-toggler .tooltip");
const chatbotCloseBtn = document.querySelector(".chatbot #close-btn");
const chatbox = document.querySelector(".chatbox .dynamic-chats");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input #send-chat-btn");
const deleteChatBtn = document.querySelector(".chat-input #delete-chat-btn");
const chatSuggestionsDiv = document.querySelector(".chat-suggestions")
const chatSuggestionButtons = chatSuggestionsDiv.querySelectorAll("button");
const inputInitHeight = chatInput.scrollHeight;

const savedChats = localStorage.getItem("chatbot-conversations");

// Initialize chat ringtone
const chatRingtone = new Audio("./chat-ringtone.mp3");
chatRingtone.volume = 0.5;

let userMessage = null;

// Restore saved chats and initial UI states
if (savedChats) {
    chatbox.innerHTML = savedChats;
    document.querySelector(".chatbox").scrollTo(0, chatbox.scrollHeight);
    chatSuggestionsDiv.style.display = "none";
}

// Create a chat list item with given content and class
const createChatLi = (content, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    chatLi.innerHTML = content;
    return chatLi;
}

// Display incoming chat message
const displayIncomingChat = (incomingChatLi, text) => {
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    if (linkRegex.test(text)) {
        const parser = new DOMParser();
        const textWithAnchors = text.replace(linkRegex, '<a href="$&" target="_blank">$&</a>');
        const parsedContent = parser.parseFromString(`<p>${textWithAnchors}</p>`, 'text/html');
        incomingChatLi.innerHTML = parsedContent.body.firstChild.innerHTML;
    } else {
        incomingChatLi.textContent = text;
    }
    chatRingtone.play();
}

// Generate response from the server
const generateResponse = async (incomingChatLi) => {
    const messageElement = document.createElement("p");
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userMessage }),
        });

        const { message } = await response.json();
        if (!response.ok) throw new Error(message);
        displayIncomingChat(messageElement, message);
    } catch (error) {
        messageElement.classList.add("error");
        messageElement.textContent = error.message;
    }

    incomingChatLi.querySelector(".typing-animation").remove();
    incomingChatLi.appendChild(messageElement);
    document.querySelector(".chatbox").scrollTo(0, chatbox.scrollHeight);
    localStorage.setItem("chatbot-conversations", chatbox.innerHTML);
}

// Show typing animation during response generation
const showTypingAnimation = () => {
    const html = `<span class="material-symbols-outlined">smart_toy</span>
                    <div class="typing-animation">
                        <div class="dot" style="--delay: 0.2s"></div>
                        <div class="dot" style="--delay: 0.3s"></div>
                        <div class="dot" style="--delay: 0.4s"></div>
                    </div>`;
    const incomingChatLi = createChatLi(html, "incoming");
    chatbox.appendChild(incomingChatLi);
    document.querySelector(".chatbox").scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
}

// Handle user's chat input
const handleChat = (buttonMessage, buttonText) => {
    userMessage = chatInput.value.trim() || buttonMessage;
    if (!userMessage) return;

    chatInput.value = "";
    chatRingtone.play();
    chatInput.style.height = `${inputInitHeight}px`;
    if(chatSuggestionsDiv) chatSuggestionsDiv.style.display = "none";

    const outgoingChatLi = createChatLi(`<p></p>`, "outgoing");
    outgoingChatLi.querySelector("p").textContent = buttonText || userMessage;
    chatbox.appendChild(outgoingChatLi);
    document.querySelector(".chatbox").scrollTo(0, chatbox.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

// Handle suggestion button click
const handleSuggestionChat = (suggestionBtn) => {
    const buttonText = suggestionBtn.innerText;
    const buttonMessage = suggestionBtn.dataset.message;
    handleChat(buttonMessage, buttonText);
}

// Delete all chat messages
const deleteAllChats = () => {
    if (confirm("Are you sure you want to delete all chats?")) {
        localStorage.removeItem("chatbot-conversations");
        if(chatSuggestionsDiv) chatSuggestionsDiv.style.display = "flex";
        chatbox.querySelectorAll(".chat").forEach(li => li.remove());
    }
}

// Suggestion button clicks
chatSuggestionButtons.forEach(suggestionBtn => {
    suggestionBtn.addEventListener("click", (e) => handleSuggestionChat(e.target));
});

// Auto-adjust chat input height
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Send chat on Enter key press
chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

// Toggle chatbot visibility
chatbotToggler.addEventListener("click", () => {
    chabotTooltip.classList.remove("show");
    document.body.classList.toggle("show-chatbot");
});

// Add event listeners
sendChatBtn.addEventListener("click", handleChat);
deleteChatBtn.addEventListener("click", deleteAllChats);
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
window.addEventListener("load", () => chabotTooltip.classList.add("show"));