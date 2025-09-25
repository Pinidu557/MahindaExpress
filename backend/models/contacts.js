import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const contactSchema = new mongoose.Schema({
  contactId: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  contactMessage: {
    type: String,
    required: true,
  },
});

contactSchema.plugin(AutoIncrement, {
  inc_field: "contactId",
  start_seq: 1001,
});

const Contact =
  mongoose.models.contacts || mongoose.model("Contact", contactSchema);

export default Contact;
