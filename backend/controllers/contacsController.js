import Contact from "../models/contacts.js";

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

export default contactUs;
