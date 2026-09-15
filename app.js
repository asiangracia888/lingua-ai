const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item[data-page]");

function showPage(pageId) {
  pages.forEach((page) => {
    page.classList.toggle("active-page", page.id === pageId);
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageId);
  });
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    showPage(item.dataset.page);
  });
});

function startScenario(scenario) {
  showPage("practice");

  const title = document.getElementById("scenario-title");
  const aiMessage = document.getElementById("ai-message");

  if (title) {
    title.textContent = scenario;
  }

  if (aiMessage) {
    const messages = {
      "Casual conversation":
        "Hey! 👋 How was your day? Tell me something interesting that happened today.",

      "Job interview":
        "Welcome! Let's practice a job interview. Tell me about yourself.",

      "Travel":
        "Let's practice travel English! ✈️ Imagine you're checking into a hotel. What would you say?"
    };

    aiMessage.textContent =
      messages[scenario] ||
      "Hey! 👋 Let's practice English together.";
  }
}

const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");
const feedback = document.getElementById("feedback");

async function sendMessage() {
  const message = input.value.trim();

  if (!message) return;

  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.innerHTML = `
    <div>
      <small>You</small>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  messagesContainer.appendChild(userMessage);

  input.value = "";
  sendBtn.disabled = true;
  sendBtn.textContent = "Thinking...";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed");
    }

    const aiMessage = document.createElement("div");
    aiMessage.className = "message ai";
    aiMessage.innerHTML = `
      <div class="bot-avatar">✦</div>
      <div>
        <small>Lingua AI</small>
        <p>${escapeHtml(data.reply)}</p>
      </div>
    `;

    messagesContainer.appendChild(aiMessage);

    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = "Nice! Keep practicing your English.";
    }
  } catch (error) {
    console.error(error);

    const errorMessage = document.createElement("div");
    errorMessage.className = "message ai";
    errorMessage.innerHTML = `
      <div class="bot-avatar">!</div>
      <div>
        <small>Lingua AI</small>
        <p>Sorry, I couldn't connect to the AI right now.</p>
      </div>
    `;

    messagesContainer.appendChild(errorMessage);
  }

  sendBtn.disabled = false;
  sendBtn.textContent = "Send →";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

if (input) {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
}


// Voice input
const micBtn = document.getElementById("micBtn");
const voiceStatus = document.getElementById("voiceStatus");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (micBtn && SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  micBtn.addEventListener("click", () => {
    recognition.start();

    if (voiceStatus) {
      voiceStatus.textContent = "Listening...";
    }
  });

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;

    if (voiceStatus) {
      voiceStatus.textContent = "Voice input received.";
    }
  };

  recognition.onerror = () => {
    if (voiceStatus) {
      voiceStatus.textContent = "Voice input is unavailable.";
    }
  };

  recognition.onend = () => {
    if (voiceStatus && voiceStatus.textContent === "Listening...") {
      voiceStatus.textContent =
        "Voice mode uses your browser's speech recognition when available.";
    }
  };
} else if (micBtn) {
  micBtn.addEventListener("click", () => {
    if (voiceStatus) {
      voiceStatus.textContent =
        "Voice recognition isn't supported by this browser.";
    }
  });
}


// Start on Dashboard
showPage("dashboard");