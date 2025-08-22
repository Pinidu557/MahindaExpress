import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const PassengerNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-between items-center p-4  absolute top-0 sm:p-6 sm:px-24">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 hover:bg-gray-300 transition-all cursor-pointer"
      >
        Login <img src={assets.arrow_icon} alt="Login" />
      </button>
    </div>
  );
};

export default PassengerNavbar;
