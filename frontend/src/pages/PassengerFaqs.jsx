import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react"; // icon library
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";

const faqs = [
  {
    question: "What is Mahinda Express?",
    answer:
      "Mahinda Express is a bus seat booking web application that allows users to book bus tickets online from the comfort of their home or office.",
  },
  {
    question: "How do I use Mahinda Express?",
    answer:
      "You can search for available buses, choose your seats, and pay securely online.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel your booking within five hours according to policies.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes, we use secure payment gateways to protect your financial information.",
  },
  {
    question: "What if I need help?",
    answer:
      "You can contact our 24/7 support team via chat, email, or phone for assistance.",
  },
  {
    question: "Are there any discounts available?",
    answer:
      "We offer various promotions and discounts from time to time. Check our website for the latest offers.",
  },
];

const PassengerFaqs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <div className=" flex flex-col min-h-screen bg-slate-900 text-white w-full">
      <PassengerNavbar />
      {/* FAQ Accordion */}
      <div className="space-y-4 max-w-3xl mx-auto mt-10 bg-slate-900 w-[100%] mb-8">
        <h1 className="text-3xl font-bold text-center mb-8 mt-25">
          Frequently Asked Questions
        </h1>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className=" bg-gray-800 rounded-xl shadow-lg p-4 cursor-pointer mb-7"
            onClick={() => toggleAccordion(index)}
          >
            <div className="flex justify-between items-center">
              <h2
                className={`text-lg font-semibold ${
                  openIndex === index ? "text-white" : "text-white"
                }`}
              >
                {faq.question}
              </h2>
              {openIndex === index ? (
                <ChevronUp className="text-white" />
              ) : (
                <ChevronDown className="text-gray-400" />
              )}
            </div>
            {openIndex === index && (
              <p className="mt-3 text-gray-300">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default PassengerFaqs;
