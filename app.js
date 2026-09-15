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
  const messages = {
    "Casual conversation":
      "Hey! 👋 How was your day? Tell me something interesting that happened today.",
    "Job interview":
      "Welcome! Let's practice a job interview. Tell me about yourself.",
    "Travel":
      "Let's practice travel English! ✈️ Imagine you're checking into a hotel. What would you say?"
  };
  if (title) title.textContent = scenario;
  if (aiMessage) {
    aiMessage.textContent =
      messages[scenario] || "Hey! 👋 Let's practice English together.";
  }
}
// ================================
// AI CHAT
// ================================
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
      feedback.textContent =
        "Nice! Keep practicing your English.";
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
// ================================
// VOICE INPUT
// ================================
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
      voiceStatus.textContent =
        "Voice input is unavailable.";
    }
  };
  recognition.onend = () => {
    if (
      voiceStatus &&
      voiceStatus.textContent === "Listening..."
    ) {
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
// ================================
// AUTH
// ================================
const authScreen = document.getElementById("auth-screen");
const authName = document.getElementById("auth-name");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const authMessage = document.getElementById("auth-message");
// ================================
// SHOW APP
// ================================
function showApp() {
  if (authScreen) {
    authScreen.style.display = "none";
  }
  const app = document.querySelector(".app");
  if (app) {
    app.style.display = "block";
  }
  showPage("dashboard");
}
// ================================
// SHOW AUTH
// ================================
function showAuth() {
  if (authScreen) {
    authScreen.style.display = "flex";
  }
  const app = document.querySelector(".app");
  if (app) {
    app.style.display = "none";
  }
}
// ================================
// SIGN UP
// ================================
async function signUp(email, password, name) {
  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
  if (error) {
    console.error("Sign up error:", error);
    if (authMessage) {
      authMessage.textContent = error.message;
    }
    return;
  }
  if (data.user) {
    // Email confirmation is enabled
    if (!data.session) {
      if (authMessage) {
        authMessage.textContent =
          "Account created! Check your email to confirm your account.";
      }
      return;
    }
    // Email confirmation is disabled
    if (authMessage) {
      authMessage.textContent =
        "Account created successfully!";
    }
    showApp();
    await loadUser();
  }
}
// ================================
// SIGN IN
// ================================
async function signIn(email, password) {
  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
  if (error) {
    console.error("Login error:", error);
    if (authMessage) {
      authMessage.textContent = error.message;
    }
    return;
  }
  if (data.user) {
    showApp();
    await loadUser();
  }
}
// ================================
// SIGN UP BUTTON
// ================================
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const name = authName.value.trim();
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!name || !email || !password) {
      authMessage.textContent =
        "Please fill in all fields.";
      return;
    }
    if (password.length < 6) {
      authMessage.textContent =
        "Password must be at least 6 characters.";
      return;
    }
    authMessage.textContent =
      "Creating account...";
    signupBtn.disabled = true;
    await signUp(email, password, name);
    signupBtn.disabled = false;
  });
}
// ================================
// LOGIN BUTTON
// ================================
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) {
      authMessage.textContent =
        "Enter your email and password.";
      return;
    }
    authMessage.textContent =
      "Signing in...";
    loginBtn.disabled = true;
    await signIn(email, password);
    loginBtn.disabled = false;
  });
}
// ================================
// RESTORE USER SESSION
// ================================
async function loadUser() {
  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();
  // ================================
  // USER IS NOT AUTHENTICATED
  // ================================
  if (error || !user) {
    showAuth();
    return;
  }
  // ================================
  // USER IS AUTHENTICATED
  // ================================
  const name =
    user.user_metadata?.name || "Learner";
  const profileName =
    document.querySelector(
      ".profile-mini strong"
    );
  if (profileName) {
    profileName.textContent = name;
  }
  const avatar =
    document.querySelector(
      ".profile-mini .avatar"
    );
  if (avatar) {
    avatar.textContent =
      name.charAt(0).toUpperCase();
  }
  showApp();
}
// ================================
// AUTH STATE LISTENER
// ================================
supabaseClient.auth.onAuthStateChange(
  (event, session) => {
    if (session) {
      showApp();
    } else {
      showAuth();
    }
  }
);
// ================================
// CHECK SESSION ON PAGE LOAD
// ================================
loadUser();