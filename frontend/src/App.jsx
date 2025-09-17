import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RoutesPage from "./pages/RoutesPage";
import VehiclesPage from "./pages/VehiclesPage";
import PassengerHome from "./pages/PassengerHome";
import PassengerLogin from "./pages/PassengerLogin";
import PassengerEmailVerify from "./pages/PassengerEmailVerify";
import PassengerRestPassword from "./pages/PassengerRestPassword";
import PassengerJourney from "./pages/PassengerJourney";
import PassengerAboutus from "./pages/PassengerAboutus";
import Contactus from "./pages/PassengerContactus";
import PassengerCheckout from "./pages/PassengerCheckout";
import PassengerFaqs from "./pages/PassengerFaqs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PassengerPayment from "./pages/PassengerPayment";
import PaymentSuccess from "./pages/PaymentSuccess";

export const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<PassengerHome />} />
        <Route path="/login" element={<PassengerLogin />} />
        <Route path="/email-verify" element={<PassengerEmailVerify />} />
        <Route path="/reset-password" element={<PassengerRestPassword />} />
        <Route path="/journeys" element={<PassengerJourney />} />
        <Route path="aboutus" element={<PassengerAboutus />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/journeys/checkout" element={<PassengerCheckout />} />
        <Route path="/faqs" element={<PassengerFaqs />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route
          path="/journeys/checkout/payment"
          element={<PassengerPayment />}
        />
        <Route
          path="/journeys/checkout/payment/payment-success"
          element={<PaymentSuccess />}
        />
      </Routes>
    </div>
  );
};

export default App;
