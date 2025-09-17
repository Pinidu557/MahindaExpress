import React from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { CircleCheckBig } from "lucide-react";
import Button from "../components/ui/Button";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg mt-60 mb-40 flex flex-col items-center">
        <CircleCheckBig className="text-green-500 mb-4" size={55} />
        <h1 className="text-3xl font-bold text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg mb-6">
          Thank you for your booking. Your payment has been processed
          successfully.
        </p>
        <Button className="cursor-pointer" onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
