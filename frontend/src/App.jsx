import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import VehiclesPage from "./pages/vehicles.jsx";
import PartsPage from "./pages/parts.jsx";
import MaintenancePage from "./pages/maintenance.jsx";
import FuelPage from "./pages/fuel.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import ReportsPage from "./pages/reports.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PassengerPayment from "./pages/PassengerPayment";
import PassengerBankTransfer from "./pages/PassengerBankTransfer";
import PaymentSuccess from "./pages/PaymentSuccess";
import PassengerDashboard from "./pages/PassengerDashboard";
import BookingDetails from "./pages/BookingDetails";
import UserManagement from "./pages/UserManagement";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-900 text-white p-4 space-y-4">
        <div className="text-lg font-bold">Mahinda Express</div>
        <nav className="space-y-1">
          <NavLink to="/" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-blue-800" : "hover:bg-blue-800"}`}>Dashboard</NavLink>
          <NavLink to="/vehicles" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-blue-800" : "hover:bg-blue-800"}`}>Vehicles</NavLink>
          <NavLink to="/parts" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-blue-800" : "hover:bg-blue-800"}`}>Parts</NavLink>
          <NavLink to="/maintenance" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-blue-800" : "hover:bg-blue-800"}`}>Maintenance</NavLink>
          <NavLink to="/fuel" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-blue-800" : "hover:bg-blue-800"}`}>Fuel</NavLink>
          <NavLink to="/reports" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? "bg-blue-800" : "hover:bg-blue-800"}`}>Reports</NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
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
      </Routes>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/vehicles" element={<Layout><VehiclesPage /></Layout>} />
        <Route path="/parts" element={<Layout><PartsPage /></Layout>} />
        <Route path="/maintenance" element={<Layout><MaintenancePage /></Layout>} />
        <Route path="/fuel" element={<Layout><FuelPage /></Layout>} />
        <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
