import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import Dashboard from "./pages/Dashboard";
import RoutesPage from "./pages/RoutesPage";
import VehiclesPage from "./pages/VehiclesPage";
import AdminLogin from "./pages/AdminLogin";
import PassengerHome from "./pages/PassengerHome";
import PassengerLogin from "./pages/PassengerLogin";
import PassengerEmailVerify from "./pages/PassengerEmailVerify";
import PassengerRestPassword from "./pages/PassengerRestPassword";
import PassengerJourney from "./pages/PassengerJourney";
import PassengerAboutus from "./pages/PassengerAboutus";
import Contactus from "./pages/PassengerContactus";
import PassengerCheckout from "./pages/PassengerCheckout";
import PassengerFaqs from "./pages/PassengerFaqs";
import { AppContent } from "../context/AppContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { isLoggedin } = useContext(AppContent);
  return (
    <>
      <Routes>
        {/* Passenger routes */}
        <Route path="/" element={<PassengerHome />} />
        <Route path="/login" element={<PassengerLogin />} />
        <Route path="/email-verify" element={<PassengerEmailVerify />} />
        <Route path="/reset-password" element={<PassengerRestPassword />} />
        <Route path="/journeys" element={<PassengerJourney />} />
        <Route path="/aboutus" element={<PassengerAboutus />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/journeys/checkout" element={<PassengerCheckout />} />
        <Route path="/faqs" element={<PassengerFaqs />} />

        {/* Admin login page - public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route
          path="/dashboard"
          element={isLoggedin ? <Dashboard /> : <Navigate to="/admin/login" />}
        />
        <Route
          path="/routes"
          element={isLoggedin ? <RoutesPage /> : <Navigate to="/admin/login" />}
        />
        <Route
          path="/vehicles"
          element={
            isLoggedin ? <VehiclesPage /> : <Navigate to="/admin/login" />
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
