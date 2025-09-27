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

  const onSubmitHandler = async (e) => {
    e.preventDefault();
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
      data.success ? toast.success(data.message) : toast.error(data.message);
      setName("");
      setEmail("");
      setPhoneNumber("");
      setContactMessage("");
    } catch (error) {
      toast.error(error.message);
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
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700
               focus:border-blue-500 focus:ring focus:ring-blue-400 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className=" w-full px-4 py-3 rounded-lg bg-slate-900 border  border-slate-700
              focus:border-blue-500 focus:ring focus:ring-blue-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className=" w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700
              focus:border-blue-500 focus:ring focus:ring-blue-400 outline-none"
              value={phonenumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <textarea
              rows="4"
              placeholder="Leave a Message"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border  border-slate-700
              focus:border-blue-500 focus:ring focus:ring-blue-400 outline-none"
              value={contactmessage}
              onChange={(e) => setContactMessage(e.target.value)}
            ></textarea>
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white transition cursor-pointer">
              Send Us A Message
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
              <p className="text-gray-200">No: 523/1 New Kandy Road,Biyagama</p>
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
