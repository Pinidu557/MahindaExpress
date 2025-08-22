import React from "react";
import { Routes, Route } from "react-router-dom";
import PassengerHome from "./pages/PassengerHome";
import PassengerLogin from "./pages/PassengerLogin";
import PassengerEmailVerify from "./pages/PassengerEmailVerify";
import PassengerRestPassword from "./pages/PassengerRestPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<PassengerHome />} />
        <Route path="/login" element={<PassengerLogin />} />
        <Route path="/email-verify" element={<PassengerEmailVerify />} />
        <Route path="/reset-password" element={<PassengerRestPassword />} />
      </Routes>
    </div>
  );
};

export default App;
