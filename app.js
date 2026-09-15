// ================================
// PAGE NAVIGATION
// ================================

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

// ================================
// PRACTICE SCENARIOS
// ================================

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

  if (title) {
    title.textContent = scenario;
  }

  if (aiMessage) {
    aiMessage.textContent =
      messages[scenario] ||
      "Hey! 👋 Let's practice English together.";
  }
}

// ================================
// USER PROFILE / STATISTICS
// ================================

let currentProfile = null;

async function loadProfile(userId) {
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Profile loading error:", error);
    return null;
  }

  currentProfile = profile;

  updateDashboard(profile);

  return profile;
}

// ================================
// UPDATE DASHBOARD
// ================================

function updateDashboard(profile) {
  if (!profile) return;

  // Current level
  const statCards = document.querySelectorAll(".stats .stat-card");

  if (statCards[0]) {
    const level = statCards[0].querySelector("strong");

    if (level) {
      level.textContent = profile.level;
    }

    const description = statCards[0].querySelector("small");

    if (description) {
      const levelNames = {
        A1: "Beginner",
        A2: "Elementary",
        B1: "Intermediate",
        B2: "Upper-intermediate",
        C1: "Advanced",
        C2: "Proficient"
      };

      description.textContent =
        levelNames[profile.level] || "English learner";
    }
  }

  // Grammar
  if (statCards[1]) {
    const value = Math.max(
      0,
      Math.min(100, Number(profile.grammar_score) || 0)
    );

    const strong = statCards[1].querySelector("strong");
    const bar = statCards[1].querySelector(".bar i");

    if (strong) {
      strong.textContent = `${value}%`;
    }

    if (bar) {
      bar.style.width = `${value}%`;
    }
  }

  // Speaking
  if (statCards[2]) {
    const value = Math.max(
      0,
      Math.min(100, Number(profile.speaking_score) || 0)
    );

    const strong = statCards[2].querySelector("strong");
    const bar = statCards[2].querySelector(".bar i");

    if (strong) {
      strong.textContent = `${value}%`;
    }

    if (bar) {
      bar.style.width = `${value}%`;
    }
  }

  // Vocabulary
  if (statCards[3]) {
    const value = Math.max(
      0,
      Math.min(100, Number(profile.vocabulary_score) || 0)
    );

    const strong = statCards[3].querySelector("strong");
    const bar = statCards[3].querySelector(".bar i");

    if (strong) {
      strong.textContent = `${value}%`;
    }

    if (bar) {
      bar.style.width = `${value}%`;
    }
  }

  // Streak
  const streak = document.querySelector(".streak");

  if (streak) {
    streak.textContent =
      `🔥 ${profile.streak || 0} day streak`;
  }

  // Progress page level
  const levelCircle = document.querySelector(".level-circle");

  if (levelCircle) {
    levelCircle.innerHTML = `
      ${profile.level}
      <small>level</small>
    `;
  }

  // Conversations
  const conversationCount =
    document.getElementById("conversationCount");

  if (conversationCount) {
    conversationCount.textContent =
      profile.messages_count || 0;
  }

  // Progress bar on progress page
  const progressBar =
    document.querySelector(".progress-panel .bar.big i");

  if (progressBar) {
    const xp = Number(profile.xp) || 0;

    // Simple progress system for now.
    // Every 100 XP = another 10% toward the next level.
    const progress = Math.min(
      100,
      Math.round((xp % 1000) / 10)
    );

    progressBar.style.width = `${progress}%`;
  }

  const progressText =
    document.querySelector(".progress-panel .bar.big + small");

  if (progressText) {
    const xp = Number(profile.xp) || 0;
    const progress = Math.min(
      100,
      Math.round((xp % 1000) / 10)
    );

    progressText.textContent =
      `${progress}% toward next level`;
  }
}

// ================================
// UPDATE PROFILE AFTER PRACTICE
// ================================

async function updatePracticeStats() {
  if (!currentProfile) return;

  const newMessages =
    (Number(currentProfile.messages_count) || 0) + 1;

  const newXP =
    (Number(currentProfile.xp) || 0) + 10;

  const { data, error } = await supabaseClient
    .from("profiles")
    .update({
      messages_count: newMessages,
      xp: newXP,
      updated_at: new Date().toISOString()
    })
    .eq("id", currentProfile.id)
    .select()
    .single();

  if (error) {
    console.error(
      "Could not update practice statistics:",
      error
    );
    return;
  }

  currentProfile = data;

  updateDashboard(currentProfile);
}

// ================================
// AI CHAT
// ================================

const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer =
  document.getElementById("messages");
const feedback =
  document.getElementById("feedback");

async function sendMessage() {
  if (!input || !sendBtn || !messagesContainer) {
    return;
  }

  const message = input.value.trim();

  if (!message) return;

  // Show user message
  const userMessage =
    document.createElement("div");

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
      throw new Error(
        data.error || "AI request failed"
      );
    }

    // Show AI response
    const aiMessage =
      document.createElement("div");

    aiMessage.className = "message ai";

    aiMessage.innerHTML = `
      <div class="bot-avatar">✦</div>

      <div>
        <small>Lingua AI</small>
        <p>${escapeHtml(data.reply)}</p>
      </div>
    `;

    messagesContainer.appendChild(aiMessage);

    // Feedback
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent =
        "Nice! Keep practicing your English.";
    }

    // Update user's statistics
    await updatePracticeStats();

  } catch (error) {
    console.error(error);

    const errorMessage =
      document.createElement("div");

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

// ================================
// ESCAPE HTML
// ================================

function escapeHtml(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// ================================
// SEND BUTTON
// ================================

if (sendBtn) {
  sendBtn.addEventListener(
    "click",
    sendMessage
  );
}

// ================================
// ENTER TO SEND
// ================================

if (input) {
  input.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        sendMessage();
      }
    }
  );
}

// ================================
// VOICE INPUT
// ================================

const micBtn =
  document.getElementById("micBtn");

const voiceStatus =
  document.getElementById("voiceStatus");

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (micBtn && SpeechRecognition) {
  const recognition =
    new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  micBtn.addEventListener(
    "click",
    () => {
      recognition.start();

      if (voiceStatus) {
        voiceStatus.textContent =
          "Listening...";
      }
    }
  );

  recognition.onresult =
    (event) => {
      if (!input) return;

      input.value =
        event.results[0][0].transcript;

      if (voiceStatus) {
        voiceStatus.textContent =
          "Voice input received.";
      }
    };

  recognition.onerror =
    () => {
      if (voiceStatus) {
        voiceStatus.textContent =
          "Voice input is unavailable.";
      }
    };

  recognition.onend =
    () => {
      if (
        voiceStatus &&
        voiceStatus.textContent ===
          "Listening..."
      ) {
        voiceStatus.textContent =
          "Voice mode uses your browser's speech recognition when available.";
      }
    };

} else if (micBtn) {

  micBtn.addEventListener(
    "click",
    () => {
      if (voiceStatus) {
        voiceStatus.textContent =
          "Voice recognition isn't supported by this browser.";
      }
    }
  );
}

// ================================
// AUTH
// ================================

const authScreen =
  document.getElementById("auth-screen");

const authName =
  document.getElementById("auth-name");

const authEmail =
  document.getElementById("auth-email");

const authPassword =
  document.getElementById("auth-password");

const signupBtn =
  document.getElementById("signup-btn");

const loginBtn =
  document.getElementById("login-btn");

const authMessage =
  document.getElementById("auth-message");

// ================================
// SHOW APP
// ================================

function showApp() {

  if (authScreen) {
    authScreen.style.display = "none";
  }

  const app =
    document.querySelector(".app");

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

  const app =
    document.querySelector(".app");

  if (app) {
    app.style.display = "none";
  }
}

// ================================
// SIGN UP
// ================================

async function signUp(
  email,
  password,
  name
) {

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

    console.error(
      "Sign up error:",
      error
    );

    if (authMessage) {
      authMessage.textContent =
        error.message;
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

    // Email confirmation disabled
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

async function signIn(
  email,
  password
) {

  const { data, error } =
    await supabaseClient.auth
      .signInWithPassword({
        email,
        password
      });

  if (error) {

    console.error(
      "Login error:",
      error
    );

    if (authMessage) {
      authMessage.textContent =
        error.message;
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

  signupBtn.addEventListener(
    "click",
    async () => {

      const name =
        authName.value.trim();

      const email =
        authEmail.value.trim();

      const password =
        authPassword.value;

      if (
        !name ||
        !email ||
        !password
      ) {

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

      await signUp(
        email,
        password,
        name
      );

      signupBtn.disabled = false;
    }
  );
}

// ================================
// LOGIN BUTTON
// ================================

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    async () => {

      const email =
        authEmail.value.trim();

      const password =
        authPassword.value;

      if (!email || !password) {

        authMessage.textContent =
          "Enter your email and password.";

        return;
      }

      authMessage.textContent =
        "Signing in...";

      loginBtn.disabled = true;

      await signIn(
        email,
        password
      );

      loginBtn.disabled = false;
    }
  );
}

// ================================
// RESTORE USER SESSION
// ================================

async function loadUser() {

  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  // No authenticated user
  if (error || !user) {

    currentProfile = null;

    showAuth();

    return;
  }

  // User name
  const name =
    user.user_metadata?.name ||
    "Learner";

  const profileName =
    document.querySelector(
      ".profile-mini strong"
    );

  if (profileName) {
    profileName.textContent =
      name;
  }

  // Avatar
  const avatar =
    document.querySelector(
      ".profile-mini .avatar"
    );

  if (avatar) {
    avatar.textContent =
      name
        .charAt(0)
        .toUpperCase();
  }

  // Show application
  showApp();

  // Load personal profile
  const profile =
    await loadProfile(user.id);

  if (!profile) {
    console.warn(
      "No profile found for this user."
    );
  }
}

// ================================
// AUTH STATE LISTENER
// ================================

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (session) {
      showApp();

      // Don't make auth callback block UI
      setTimeout(() => {
        loadUser();
      }, 0);

    } else {

      currentProfile = null;

      showAuth();
    }
  }
);

// ================================
// CHECK SESSION ON PAGE LOAD
// ================================

loadUser();