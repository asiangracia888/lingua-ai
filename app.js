// ===============================
// LINGUA AI — MAIN APP
// ===============================

// ---------- Navigation ----------

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item[data-page]");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const pageName = item.dataset.page;

    pages.forEach((page) => {
      page.classList.toggle("active-page", page.id === pageName);
    });

    navItems.forEach((nav) => {
      nav.classList.toggle("active", nav === item);
    });
  });
});


// ---------- Chat ----------

const messages = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

if (input) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

async function sendMessage() {
  const text = input.value.trim();

  if (!text) return;

  // User message
  const userRow = document.createElement("div");
  userRow.className = "message user-msg";

  const userContent = document.createElement("div");

  const userName = document.createElement("small");
  userName.textContent = "You";

  const userText = document.createElement("p");
  userText.textContent = text;

  userContent.appendChild(userName);
  userContent.appendChild(userText);
  userRow.appendChild(userContent);

  messages.appendChild(userRow);

  input.value = "";

  // AI message
  const aiRow = document.createElement("div");
  aiRow.className = "message ai";

  const avatar = document.createElement("div");
  avatar.className = "bot-avatar";
  avatar.textContent = "✦";

  const aiContent = document.createElement("div");

  const aiName = document.createElement("small");
  aiName.textContent = "Lingua AI";

  const aiText = document.createElement("p");
  aiText.textContent = "Thinking...";

  aiContent.appendChild(aiName);
  aiContent.appendChild(aiText);

  aiRow.appendChild(avatar);
  aiRow.appendChild(aiContent);

  messages.appendChild(aiRow);

  messages.parentElement.scrollTop =
    messages.parentElement.scrollHeight;

  try {
    const response = await fetch("https://lingua-ai-2txm.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed");
    }

    aiText.textContent = data.reply;

  } catch (error) {
    console.error(error);

    aiText.textContent =
      "Sorry, I couldn't connect to Lingua AI.";
  }

  messages.parentElement.scrollTop =
    messages.parentElement.scrollHeight;
}


// ---------- Voice Input ----------

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

const mic = document.getElementById("micBtn");
const voiceStatus = document.getElementById("voiceStatus");

if (SpeechRecognition && mic) {
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  mic.addEventListener("click", () => {
    try {
      recognition.start();

      mic.classList.add("listening");

      if (voiceStatus) {
        voiceStatus.textContent =
          "Listening… speak in English.";
      }
    } catch (error) {
      console.log(error);
    }
  });

  recognition.onresult = (event) => {
    const transcript =
      event.results[0][0].transcript;

    input.value = transcript;

    if (voiceStatus) {
      voiceStatus.textContent =
        "Got it — press Send.";
    }
  };

  recognition.onend = () => {
    mic.classList.remove("listening");

    if (
      voiceStatus &&
      voiceStatus.textContent.includes("Listening")
    ) {
      voiceStatus.textContent =
        "Voice input stopped.";
    }
  };

} else if (mic) {

  mic.addEventListener("click", () => {
    alert(
      "Voice input is not supported by this browser."
    );
  });
}