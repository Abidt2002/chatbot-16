document.addEventListener("DOMContentLoaded", () => {
  const chatIcon = document.getElementById("chat-icon");
  const chatContainer = document.getElementById("devbay-chat");
  const closeChat = document.getElementById("close-chat");
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  let qaData = [];

  // ==============================
  // Load CSV File (Q&A)
  // ==============================
  fetch("DevBay Chatbot QA.csv")
    .then(response => response.text())
    .then(data => {
      const lines = data.split("\n").slice(1);
      qaData = lines.map(line => {
        const [q, a] = line.split(/,(.+)/);
        return {
          question: q?.trim().toLowerCase(),
          answer: a?.replace(/^"|"$/g, "").trim()
        };
      });
      console.log("✅ DevBay Q&A CSV Loaded");
    })
    .catch(err => console.error("❌ Error loading CSV:", err));

  // ==============================
  // Open / Close Chat Window
  // ==============================
  chatIcon.addEventListener("click", () => {
    chatContainer.classList.toggle("chat-visible");
    chatContainer.classList.toggle("chat-hidden");
  });

  closeChat.addEventListener("click", () => {
    chatContainer.classList.add("chat-hidden");
    chatContainer.classList.remove("chat-visible");
  });

  // ==============================
  // Handle Message Send
  // ==============================
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    userInput.value = "";

    // Show typing indicator before response
    showTypingIndicator();

    // Bot response after short delay
    setTimeout(() => {
      hideTypingIndicator();
      botResponse(text);
    }, 1800);
  }

  // ==============================
  // Append Messages
  // ==============================
  function appendMessage(sender, text, animate = true) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    if (sender === "bot" && animate) {
      msgDiv.innerHTML = "";
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
      typeTextSlow(msgDiv, text);
    } else {
      msgDiv.textContent = text;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  // ==============================
  // Typing Dots Animation (...)
  // ==============================
  let typingDiv = null;
  function showTypingIndicator() {
    typingDiv = document.createElement("div");
    typingDiv.classList.add("typing");
    typingDiv.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function hideTypingIndicator() {
    if (typingDiv) typingDiv.remove();
  }

  // ==============================
  // Slow Typing Effect (350ms per word)
  // ==============================
  function typeTextSlow(element, text) {
    const words = text.split(" ");
    let index = 0;

    function typeWord() {
      if (index < words.length) {
        element.innerHTML +=
          (index > 0 ? " " : "") + `<span>${words[index]}</span>`;
        index++;
        chatBox.scrollTop = chatBox.scrollHeight;
        setTimeout(typeWord, 350); // Adjust speed here (350 ms per word)
      }
    }
    typeWord();
  }

  // ==============================
  // Bot Response Lookup
  // ==============================
  function botResponse(input) {
    const normalized = input.toLowerCase();
    const match = qaData.find(
      qa =>
        normalized.includes(qa.question) ||
        qa.question.includes(normalized)
    );

    const answer = match
      ? match.answer
      : "I'm sorry, I couldn’t find an answer to that. Please ask something else about DevBay.";
    appendMessage("bot", answer);
  }
});
