import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
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
import PassengerBankTransfer from "./pages/PassengerBankTransfer";
import PaymentSuccess from "./pages/PaymentSuccess";
import PassengerDashboard from "./pages/PassengerDashboard";
import BookingDetails from "./pages/BookingDetails";
import UserManagement from "./pages/UserManagement";
import PartsPage from "./pages/parts";
import MaintenancePage from "./pages/maintenance";
import FuelPage from "./pages/fuel";
import ReportsPage from "./pages/reports";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-900 text-white p-4 space-y-4">
        <div className="text-lg font-bold">Mahinda Express</div>
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-800" : "hover:bg-blue-800"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/vehicles"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-800" : "hover:bg-blue-800"
              }`
            }
          >
            Vehicles
          </NavLink>
          <NavLink
            to="/parts"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-800" : "hover:bg-blue-800"
              }`
            }
          >
            Parts
          </NavLink>
          <NavLink
            to="/maintenance"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-800" : "hover:bg-blue-800"
              }`
            }
          >
            Maintenance
          </NavLink>
          <NavLink
            to="/fuel"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-800" : "hover:bg-blue-800"
              }`
            }
          >
            Fuel
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-800" : "hover:bg-blue-800"
              }`
            }
          >
            Reports
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export const App = () => {
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
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
          path="/journeys/checkout/bank-transfer"
          element={<PassengerBankTransfer />}
        />
        <Route
          path="/journeys/checkout/payment/payment-success"
          element={<PaymentSuccess />}
        />
        <Route path="/passengerDashboard" element={<PassengerDashboard />} />
        <Route path="/booking/:bookingId" element={<BookingDetails />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route
          path="/parts"
          element={
            <Layout>
              <PartsPage />
            </Layout>
          }
        />
        <Route
          path="/maintenance"
          element={
            <Layout>
              <MaintenancePage />
            </Layout>
          }
        />
        <Route
          path="/fuel"
          element={
            <Layout>
              <FuelPage />
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <ReportsPage />
            </Layout>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
