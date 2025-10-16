import express from "express";
import {
  sendMessage,
  getChatHistory,
  getAllChatSessions,
  clearChatSession,
  deleteChatSession,
} from "../controllers/chatBotController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes for chatbot functionality
router.post("/send-message", sendMessage);
router.get("/history/:sessionId", getChatHistory);
router.delete("/clear/:sessionId", clearChatSession);
router.delete("/delete/:sessionId", deleteChatSession);

// Admin routes for managing chat sessions
router.get("/admin/sessions", adminAuth, getAllChatSessions);

export default router;
