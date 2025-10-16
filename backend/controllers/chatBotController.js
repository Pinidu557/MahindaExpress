import ChatBot from "../models/chatBot.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Knowledge base for chatbot responses
const knowledgeBase = {
  greetings: [
    "Hello! Welcome to our bus booking service. How can I help you today?",
    "Hi there! I'm here to assist you with your bus booking needs. What would you like to know?",
    "Welcome! I'm your assistant for bus bookings and travel information. How can I help?",
  ],
  booking: [
    "To book a bus ticket, please go to the 'Journeys' section, select your route, choose your preferred date and time, then select your seats.",
    "You can book tickets by visiting our booking page, selecting your destination, and choosing your preferred travel date and time.",
    "Booking is easy! Just navigate to the journeys section, pick your route, and follow the booking process.",
    "You can click the 'Book for tomorrow →' button beside your preferred route to reserve your seat online.",
  ],
  payment: [
    "We accept multiple payment methods including credit cards, bank transfers, and online payments. You can pay securely through our checkout process.",
    "Payment options include credit/debit cards and bank transfers. All payments are processed securely.",
    "You can pay using your credit card or bank transfer. The payment process is secure and encrypted.",
  ],
  cancellation: [
    "You can cancel your booking by going to your dashboard and clicking on the cancellation option for your specific booking.",
    "To cancel, please visit your passenger dashboard and select the booking you want to cancel.",
    "Cancellation is available through your dashboard. Please note that cancellation policies may apply based on the timing.",
  ],
  routes: [
    "We operate on various routes across Sri Lanka. You can check available routes in the 'Journeys' section of our website.",
    "Our bus routes cover major cities and towns in Sri Lanka. Visit the journeys page to see all available routes and schedules.",
    "We have multiple routes available. Please check the journeys section for current routes and schedules.",
    "You can travel from Colombo to Ampara, Colombo to Anuradhapura, or Kottawa to Moragahahena today. All routes are active and certified.",
  ],
  schedule: [
    "Bus schedules vary by route. You can check specific departure times when you select your route in the booking section.",
    "Schedule information is available when you browse routes. Each route has multiple departure times throughout the day.",
    "To see schedules, please select your desired route and you'll see all available departure times.",
    "The Colombo–Ampara bus departs at 10:45 AM and arrives around 6:45 PM.",
    "The Colombo–Anuradhapura bus departs at 7:00 AM and arrives around 11:30 AM.",
    "The Kottawa–Moragahahena bus departs at 6:00 AM and arrives around 10:00 AM.",
  ],
  pricing: [
    "Each journey currently costs LKR 2000 per passenger.",
    "Ticket prices are LKR 2000 for all routes.",
    "The standard fare is LKR 2000 per passenger for all our routes.",
    "The ticket for the Colombo–Ampara journey costs LKR 2000 per passenger.",
    "The Colombo–Anuradhapura route is also priced at LKR 2000.",
    "The Kottawa–Moragahahena journey costs LKR 2000.",
    "Yes, currently all available routes cost LKR 2000 each.",
    "The displayed fare is per passenger.",
    "At the moment, there are no active discounts, but special offers may be introduced soon.",
    "Not yet — all passengers are charged the same LKR 2000 rate.",
    "Yes, the fare shown (LKR 2000) is the final price, with no hidden charges.",
    "Yes! You can pay online when you click 'Book for tomorrow →' next to your desired route.",
    "No, there are no additional booking fees — the price stays LKR 2000.",
    "Prices are fixed for now, but they might vary during special events or festive seasons.",
    "Refund eligibility depends on the cancellation policy — please check it before confirming your booking.",
    "The price is standardized at LKR 2000 to keep the booking process simple and transparent for all passengers.",
  ],
  availability: [
    "Currently, you can book for tomorrow's journey directly on the page. More date options will be added soon!",
    "You can book for tomorrow's journey using the 'Book for tomorrow →' button on the journeys page.",
    "Active routes mean the route is currently running and seats are available for booking.",
  ],
  certification: [
    "Yes! All journeys displayed on this page are certified for safety and comfort.",
    "All our buses are certified for safety and comfort standards.",
    "We ensure all our routes meet safety and comfort certification requirements.",
  ],
  timetable: [
    "Yes! Click the 'Timetable' button next to any route to see the detailed schedule.",
    "You can view the full timetable by clicking the 'Timetable' button for any route.",
    "Detailed schedules are available by clicking the 'Timetable' button next to each route.",
  ],
  support: [
    "You can message us here or reach our support team via the contact page for booking or payment help.",
    "For support, please use our contact form or reach out to our customer service team through the contact information provided.",
    "Contact information is available on our 'Contact Us' page. We're here to help with any questions or concerns.",
  ],
  missed_bus: [
    "If you miss your bus, please contact customer support immediately to check if rescheduling is possible.",
    "In case you miss your bus, contact our customer support team right away to see if we can help with rescheduling.",
    "Please contact customer support immediately if you miss your bus to check rescheduling options.",
  ],
  contact: [
    "You can contact us through our contact form on the website, or call our customer service number. Visit the 'Contact Us' page for more details.",
    "For support, please use our contact form or reach out to our customer service team through the contact information provided.",
    "Contact information is available on our 'Contact Us' page. We're here to help with any questions or concerns.",
  ],
  default: [
    "I'm here to help with bus booking questions. Could you please rephrase your question or ask about bookings, payments, routes, or schedules?",
    "I understand you have a question. Please ask me about bus bookings, routes, payments, or any other travel-related topics.",
    "I'm designed to help with bus booking inquiries. Please let me know if you need help with booking, routes, or payment information.",
  ],
};

// Function to find the best response based on user input
const findBestResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Check for greeting patterns
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)];
  }
  
  // Check for pricing questions
  if (message.includes("price") || message.includes("cost") || message.includes("fare") || message.includes("ticket price") || message.includes("how much") || 
      message.includes("discount") || message.includes("refund") || message.includes("tax") || message.includes("charge") || message.includes("booking fee") ||
      message.includes("weekend") || message.includes("holiday") || message.includes("standardized") || message.includes("per person") || message.includes("per passenger")) {
    return knowledgeBase.pricing[Math.floor(Math.random() * knowledgeBase.pricing.length)];
  }
  
  // Check for availability questions
  if (message.includes("available") || message.includes("today") || message.includes("tomorrow") || message.includes("date") || message.includes("active")) {
    return knowledgeBase.availability[Math.floor(Math.random() * knowledgeBase.availability.length)];
  }
  
  // Check for certification questions
  if (message.includes("certified") || message.includes("certification") || message.includes("safety") || message.includes("comfort")) {
    return knowledgeBase.certification[Math.floor(Math.random() * knowledgeBase.certification.length)];
  }
  
  // Check for timetable questions
  if (message.includes("timetable") || message.includes("full schedule") || message.includes("detailed schedule")) {
    return knowledgeBase.timetable[Math.floor(Math.random() * knowledgeBase.timetable.length)];
  }
  
  // Check for missed bus questions
  if (message.includes("miss") || message.includes("missed") || message.includes("late") || message.includes("reschedule")) {
    return knowledgeBase.missed_bus[Math.floor(Math.random() * knowledgeBase.missed_bus.length)];
  }
  
  // Check for support questions
  if (message.includes("support") || message.includes("help") || message.includes("issue") || message.includes("problem")) {
    return knowledgeBase.support[Math.floor(Math.random() * knowledgeBase.support.length)];
  }
  
  // Check for booking-related questions
  if (message.includes("book") || message.includes("ticket") || message.includes("reserve")) {
    return knowledgeBase.booking[Math.floor(Math.random() * knowledgeBase.booking.length)];
  }
  
  // Check for payment-related questions
  if (message.includes("pay") || message.includes("payment") || message.includes("card") || message.includes("bank")) {
    return knowledgeBase.payment[Math.floor(Math.random() * knowledgeBase.payment.length)];
  }
  
  // Check for cancellation questions
  if (message.includes("cancel") || message.includes("refund") || message.includes("return")) {
    return knowledgeBase.cancellation[Math.floor(Math.random() * knowledgeBase.cancellation.length)];
  }
  
  // Check for route-related questions
  if (message.includes("route") || message.includes("destination") || message.includes("where") || message.includes("go") || message.includes("journey")) {
    return knowledgeBase.routes[Math.floor(Math.random() * knowledgeBase.routes.length)];
  }
  
  // Check for schedule questions
  if (message.includes("time") || message.includes("schedule") || message.includes("depart") || message.includes("when") || message.includes("leave") || message.includes("arrive")) {
    return knowledgeBase.schedule[Math.floor(Math.random() * knowledgeBase.schedule.length)];
  }
  
  // Check for contact questions
  if (message.includes("contact") || message.includes("phone") || message.includes("reach")) {
    return knowledgeBase.contact[Math.floor(Math.random() * knowledgeBase.contact.length)];
  }
  
  // Default response
  return knowledgeBase.default[Math.floor(Math.random() * knowledgeBase.default.length)];
};

// Send message to chatbot
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, sessionId, userId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({
      success: false,
      message: "Message and session ID are required",
    });
  }

  try {
    // Find or create chat session
    let chatSession = await ChatBot.findOne({ sessionId });

    if (!chatSession) {
      chatSession = new ChatBot({
        sessionId,
        userId: userId || null,
        messages: [],
      });
    }

    // Add user message
    chatSession.messages.push({
      type: "user",
      message: message,
      timestamp: new Date(),
    });

    // Generate bot response
    const botResponse = findBestResponse(message);

    // Add bot response
    chatSession.messages.push({
      type: "bot",
      message: botResponse,
      timestamp: new Date(),
    });

    // Save the chat session
    await chatSession.save();

    res.json({
      success: true,
      response: botResponse,
      sessionId: chatSession.sessionId,
      messageHistory: chatSession.messages,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process message",
      error: error.message,
    });
  }
});

// Get chat history
export const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID is required",
    });
  }

  try {
    const chatSession = await ChatBot.findOne({ sessionId });

    if (!chatSession) {
      return res.json({
        success: true,
        messages: [],
        sessionId,
      });
    }

    res.json({
      success: true,
      messages: chatSession.messages,
      sessionId: chatSession.sessionId,
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve chat history",
      error: error.message,
    });
  }
});

// Get all chat sessions (for admin purposes)
export const getAllChatSessions = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const chatSessions = await ChatBot.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "firstName lastName email")
      .select("sessionId messages userId createdAt updatedAt");

    const total = await ChatBot.countDocuments({ isActive: true });

    res.json({
      success: true,
      chatSessions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error in getAllChatSessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve chat sessions",
      error: error.message,
    });
  }
});

// Clear chat session
export const clearChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID is required",
    });
  }

  try {
    const chatSession = await ChatBot.findOne({ sessionId });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Clear messages but keep the session
    chatSession.messages = [];
    await chatSession.save();

    res.json({
      success: true,
      message: "Chat session cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearChatSession:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear chat session",
      error: error.message,
    });
  }
});

// Delete chat session
export const deleteChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID is required",
    });
  }

  try {
    const chatSession = await ChatBot.findOne({ sessionId });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    chatSession.isActive = false;
    await chatSession.save();

    res.json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteChatSession:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete chat session",
      error: error.message,
    });
  }
});
