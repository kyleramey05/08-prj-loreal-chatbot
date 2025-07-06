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

// Helper: add message to chat
function addMessage(text, sender = "ai") {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Set initial message
chatWindow.innerHTML = "";
addMessage("👋 Hello! I can answer questions about L'Oréal products, routines, recommendations, and beauty-related topics. How can I help you today?", "ai");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  // Show user message
  addMessage(question, "user");
  userInput.value = "";

  // Only answer L'Oréal or beauty-related questions
  if (!isLorealOrBeautyQuestion(question)) {
    addMessage("Sorry, I can only answer questions about L'Oréal products, routines, recommendations, or beauty-related topics.", "ai");
    return;
  }

  // Show loading message
  addMessage("Thinking...", "ai");

  // Prepare OpenAI API call
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant that only answers questions about L'Oréal products, routines, recommendations, and beauty-related topics. If the question is not about these, politely refuse to answer." },
          { role: "user", content: question }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });
    const data = await response.json();
    // Remove loading message
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") chatWindow.removeChild(loadingMsg);
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      addMessage(data.choices[0].message.content, "ai");
    } else {
      addMessage("Sorry, I couldn't get a response. Please try again.", "ai");
    }
  } catch (err) {
    // Remove loading message
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") chatWindow.removeChild(loadingMsg);
    addMessage("There was an error connecting to the chatbot. Please check your API key and internet connection.", "ai");
  }
});
