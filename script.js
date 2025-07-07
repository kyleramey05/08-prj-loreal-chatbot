/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Only allow questions about L'Oréal, beauty, and related topics
const allowedTopics = [
  "l'oreal", "loreal", "product", "products", "routine", "recommendation", "skin", "hair", "makeup", "cosmetic", "serum", "moisturizer", "shampoo", "conditioner", "mask", "brand", "best", "how to use", "which", "what", "when", "where", "why", "who", "ingredient", "suitable", "for me", "for my skin", "for my hair", "men", "women", "kids", "safe", "sensitive", "oily", "dry", "normal", "combination", "anti-aging", "hydration", "spf", "sun", "protection", "color", "dye", "treatment", "repair", "frizz", "volume", "shine", "curl", "straight", "recommend", "suggest", "help", "advice", "beauty", "skincare", "haircare", "fragrance", "perfume", "face", "body", "eye", "lip", "nail", "cleanser", "toner", "exfoliate", "exfoliator", "mask", "cream", "lotion", "oil", "gel", "foam", "mousse", "spray", "styling", "beauty routine", "beauty tips", "beauty advice", "beauty product", "beauty brand"
];

// Helper: check if input is about L'Oréal or beauty
function isLorealOrBeautyQuestion(text) {
  const lower = text.toLowerCase();
  return allowedTopics.some(topic => lower.includes(topic));
}

// Conversation history for context
let conversationHistory = [
  { role: "system", content: "You are a helpful assistant that only answers questions about L'Oréal products, routines, recommendations, and beauty-related topics. If the question is not about these, politely refuse to answer." }
];
let userName = null;

// Helper: add message bubble to chat
function addMessage(text, sender = "ai") {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg-bubble ${sender}`;
  msgDiv.setAttribute("role", "region");
  msgDiv.setAttribute("aria-live", sender === "ai" ? "polite" : "off");
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper: show latest user question above response
function showLatestUserQuestion(question) {
  let latestQ = document.getElementById("latest-question");
  if (!latestQ) {
    latestQ = document.createElement("div");
    latestQ.id = "latest-question";
    latestQ.className = "latest-question";
    chatWindow.appendChild(latestQ);
  }
  latestQ.textContent = `You asked: ${question}`;
  latestQ.style.fontWeight = "bold";
  latestQ.style.margin = "16px 0 4px 0";
  latestQ.style.color = "#000";
}

// Set initial message
chatWindow.innerHTML = "";
addMessage("👋 Hello! I can answer questions about L'Oréal products, routines, recommendations, and beauty-related topics. How can I help you today?", "ai");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  // Ask for name if not set
  if (!userName) {
    if (/my name is (.+)/i.test(question)) {
      userName = question.match(/my name is (.+)/i)[1].split(" ")[0];
      addMessage(`Nice to meet you, ${userName}!`, "ai");
      userInput.value = "";
      return;
    } else {
      addMessage("Before we start, what's your name? (Type: My name is ...)", "ai");
      userInput.value = "";
      return;
    }
  }

  // Show user message as bubble
  addMessage(question, "user");
  showLatestUserQuestion(question);
  userInput.value = "";

  // Only answer L'Oréal or beauty-related questions
  if (!isLorealOrBeautyQuestion(question)) {
    addMessage("Sorry, I can only answer questions about L'Oréal products, routines, recommendations, or beauty-related topics.", "ai");
    return;
  }

  // Add to conversation history
  conversationHistory.push({ role: "user", content: question });
  addMessage("Thinking...", "ai");

  try {
    const response = await fetch("https://green-pond-0ef8.kyramey.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: conversationHistory })
    });
    const data = await response.json();
    // Remove loading message
    const loadingMsg = chatWindow.querySelector(".msg-bubble.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") chatWindow.removeChild(loadingMsg);
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      addMessage(data.choices[0].message.content, "ai");
      conversationHistory.push({ role: "assistant", content: data.choices[0].message.content });
    } else {
      addMessage("Sorry, I couldn't get a response. Please try again.", "ai");
    }
  } catch (err) {
    const loadingMsg = chatWindow.querySelector(".msg-bubble.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") chatWindow.removeChild(loadingMsg);
    addMessage("There was an error connecting to the chatbot. Please check your Cloudflare Worker and internet connection.", "ai");
  }
});
