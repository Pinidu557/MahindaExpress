import React, { useContext, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Contactus = () => {
  const { backendUrl } = useContext(AppContent);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [contactmessage, setContactMessage] = useState("");

  // Validation states
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phonenumber: "",
    contactmessage: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) {
      return "Name is required";
    }
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "Name should only contain letters and spaces";
    }
    if (value.trim().length < 2) {
      return "Name should be at least 2 characters long";
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) {
      return "Phone number is required";
    }
    if (!/^[0-9]+$/.test(value)) {
      return "Phone number should only contain numbers";
    }
    if (value.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateMessage = (value) => {
    if (!value.trim()) {
      return "Message is required";
    }
    if (value.trim().length < 10) {
      return "Message should be at least 10 characters long";
    }
    if (value.trim().length > 500) {
      return "Message should not exceed 500 characters";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      phonenumber: validatePhone(phonenumber),
      contactmessage: validateMessage(contactmessage)
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/contacts/contactus",
        {
          name,
          email,
          phonenumber,
          contactmessage,
        }
      );
      
      if (data.success) {
        toast.success(data.message || "Message sent successfully!");
        // Reset form
        setName("");
        setEmail("");
        setPhoneNumber("");
        setContactMessage("");
        setErrors({
          name: "",
          email: "",
          phonenumber: "",
          contactmessage: ""
        });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen overflow-x-hidden">
      <PassengerNavbar />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 mt-45 mb-20">
        {/* Left Side */}
        <div>
          <p className="uppercase text-blue-400 font-semibold mb-2">
            Get In Touch
          </p>
          <h1 className="text-4xl font-bold mb-2 leading-12">
            Stay Connected
            <br />
            <span className="text-indigo-500 ">Let’s Talk.</span>
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            We’d love to hear from you! Whether you have questions, feedback, or
            need support, our team is here to help. Reach out to us through any
            of the methods below, and we will get back to you as soon as
            possible.
          </p>

          {/* Contact Form */}
          <form
            className="space-y-4 bg-slate-800 p-6 rounded-xl shadow-md"
            onSubmit={onSubmitHandler}
          >
            <div>
              <input
                type="text"
                placeholder="Your Name"
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border outline-none
                  ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-slate-700 focus:border-blue-500 focus:ring-blue-400"}`}
                value={name}
                onChange={(e) => {
                  const value = e.target.value;
                  setName(value);
                  // Clear error when valid input is entered
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: "" }));
                  }
                }}
                onBlur={() => {
                  setErrors(prev => ({ ...prev, name: validateName(name) }));
                }}
                onKeyDown={(e) => {
                  // Block numbers and special characters
                  if (/[0-9]/.test(e.key)) {
                    e.preventDefault();
                    setErrors(prev => ({ ...prev, name: "Numbers are not allowed" }));
                    return;
                  }
                }}
                required
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border outline-none
                  ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-slate-700 focus:border-blue-500 focus:ring-blue-400"}`}
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  // Clear error when valid input is entered
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: "" }));
                  }
                }}
                onBlur={() => {
                  setErrors(prev => ({ ...prev, email: validateEmail(email) }));
                }}
                required
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border outline-none
                  ${errors.phonenumber ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-slate-700 focus:border-blue-500 focus:ring-blue-400"}`}
                value={phonenumber}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and limit to 10 digits
                  if (/^[0-9]*$/.test(value) && value.length <= 10) {
                    setPhoneNumber(value);
                    // Clear error when valid input is entered
                    if (errors.phonenumber) {
                      setErrors(prev => ({ ...prev, phonenumber: "" }));
                    }
                  }
                }}
                onBlur={() => {
                  setErrors(prev => ({ ...prev, phonenumber: validatePhone(phonenumber) }));
                }}
                onKeyDown={(e) => {
                  // Block non-numeric characters except control keys
                  if (!/^[0-9]$/.test(e.key) && 
                      e.key !== "Backspace" && 
                      e.key !== "Delete" && 
                      e.key !== "ArrowLeft" && 
                      e.key !== "ArrowRight" && 
                      e.key !== "Tab") {
                    e.preventDefault();
                    setErrors(prev => ({ ...prev, phonenumber: "Only numbers are allowed" }));
                    return;
                  }
                  // Check if trying to exceed 10 digits
                  if (/^[0-9]$/.test(e.key) && phonenumber.length >= 10) {
                    e.preventDefault();
                    setErrors(prev => ({ ...prev, phonenumber: "Phone number cannot exceed 10 digits" }));
                    return;
                  }
                }}
                required
              />
              {errors.phonenumber && (
                <p className="text-red-400 text-xs mt-1">{errors.phonenumber}</p>
              )}
            </div>
            <div>
              <textarea
                rows="4"
                placeholder="Leave a Message "
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border outline-none resize-none
                  ${errors.contactmessage ? "border-red-500 focus:border-red-500 focus:ring-red-400" : "border-slate-700 focus:border-blue-500 focus:ring-blue-400"}`}
                value={contactmessage}
                onChange={(e) => {
                  const value = e.target.value;
                  setContactMessage(value);
                  // Clear error when valid input is entered
                  if (errors.contactmessage) {
                    setErrors(prev => ({ ...prev, contactmessage: "" }));
                  }
                }}
                onBlur={() => {
                  setErrors(prev => ({ ...prev, contactmessage: validateMessage(contactmessage) }));
                }}
                maxLength={500}
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.contactmessage && (
                  <p className="text-red-400 text-xs">{errors.contactmessage}</p>
                )}
                <p className={`text-xs ml-auto ${contactmessage.length > 450 ? 'text-red-400' : 'text-gray-400'}`}>
                  {contactmessage.length}/500 characters
                </p>
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold text-white transition cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? "bg-gray-600 cursor-not-allowed opacity-70" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                "Send Us A Message"
              )}
            </button>
          </form>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Call Us */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 rounded-xl shadow-md">
            <Phone className="w-6 h-6 text-white" />
            <div>
              <p className="font-semibold">Call Us</p>
              <p className="text-gray-200">076 374 1736</p>
            </div>
          </div>

          {/* Mail Us */}
          <div className="flex items-center gap-4 bg-slate-800 p-5 rounded-xl shadow-md">
            <Mail className="w-6 h-6 text-white" />
            <div>
              <p className="font-semibold">Mail Us</p>
              <p className="text-gray-200">info@mahindaexpress.lk</p>
            </div>
          </div>

          {/* Visit Us */}
          <div className="flex items-center gap-4 bg-slate-800 p-5 rounded-xl shadow-md">
            <MapPin className="w-6 h-6 text-white" />
            <div>
              <p className="font-semibold">Visit Us</p>
              <p className="text-gray-200">
                No: 523/1, New Kandy Road, Biyagama
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden shadow-md w-full">
            <iframe
              title="map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=79.854%2C6.877%2C79.861%2C6.882&layer=mapnik"
              className="w-full h-64 border-0"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contactus;
