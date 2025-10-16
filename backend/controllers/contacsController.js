import Contact from "../models/contacts.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const contactUs = async (req, res) => {
  const { name, email, phonenumber, contactmessage } = req.body;
  if (!name || !email || !phonenumber || !contactmessage) {
    return res.json({ success: false, message: "Fill the all form fields" });
  }
  try {
    const newContact = new Contact({
      name: name,
      email: email,
      phoneNumber: phonenumber,
      contactMessage: contactmessage,
    });
    await newContact.save();
    res.json({ success: true, message: "We will contact you later" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get all contact messages
export const getContactMessages = asyncHandler(async (req, res) => {
  try {
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .select('contactId name email phoneNumber contactMessage createdAt');
    
    res.json({
      success: true,
      contacts: contacts,
      total: contacts.length
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
      error: error.message
    });
  }
});

export default contactUs;
