import mongoose from "mongoose";

const chatBotSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  messages: [
    {
      type: {
        type: String,
        enum: ["user", "bot"],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow anonymous users
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
chatBotSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
chatBotSchema.index({ sessionId: 1, createdAt: -1 });
chatBotSchema.index({ userId: 1, createdAt: -1 });

const ChatBot = mongoose.model("ChatBot", chatBotSchema);

export default ChatBot;
