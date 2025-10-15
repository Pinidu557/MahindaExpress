import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
// Staff Management imports
import DashboardHirun from "./pages/DashboardHirun.jsx";
import AppSidebar from "./components/AppSidebar.jsx";
import Staff from "./pages/StaffPage.jsx";
import CreateStaffPage from "./pages/CreateStaffPage.jsx";
import StaffListPage from "./pages/StaffListPage.jsx";
import StaffProfilePage from "./pages/StaffProfilePage.jsx";
import AssignStaffPage from "./pages/AssignStaffPage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import PayrollPage from "./pages/PayrollPage.jsx";
// Passenger and Main System imports
import Dashboard from "./pages/Dashboard";
import RoutesPage from "./pages/RoutesPage.jsx";
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
import DashboardPage from "./pages/dashboardkaveesha";
import VehiclesPage from "./pages/VehiclesPage";
import AdminLogin from "./pages/AdminLogin";
import { useAdminAuth } from "./hooks/useAdminAuth";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
// Import the new Finance Layout component
import FinanceLayout from "./components/FinanceLayout"; 
import FinanceDashboardPage from "./pages/FinanceDashboardPage"; 
import BudgetsPage from "./pages/BudgetsPage"; 
import PayRollPageFinance from "./pages/PayRollPageFinance"; 
import LoansPage from "./pages/LoansPage"; 
import AdvancePage from "./pages/AdvancePage"; 
import SalaryForm from "./pages/SalaryForm.jsx";
import SalarySlipView from "./pages/SalarySlipView.jsx";
import ChatBot from "./components/ChatBot.jsx";

// Layout component for admin dashboard
const Layout = ({ children }) => {
  const { adminData, logout } = useAdminAuth();
  // Check if we're on the maintenance page
  const isMaintenancePage = window.location.pathname === "/maintenance";

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      <aside className="w-64 bg-blue-900 text-white p-4 space-y-4">
        <div className="text-lg font-bold">Mahinda Express</div>

        {/* Admin Info - Hidden on maintenance page */}
        {adminData && !isMaintenancePage && (
          <div className="bg-blue-800 p-3 rounded-lg">
            <p className="text-sm text-blue-200">Welcome,</p>
            <p className="font-semibold">{adminData.name}</p>
            <p className="text-xs text-blue-300">{adminData.email}</p>
          </div>
        )}

        <nav className="space-y-1">
          <NavLink
            to="/dashboard-admin"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-800" : "hover:bg-blue-800"
              }`
            }
          >
            Dashboard
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
          <NavLink
            to="/Dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-red-800" : "hover:bg-red-800"
              }`
            }
          >
            Main Dashboard
          </NavLink>
        </nav>

        {/* Logout Button - Hidden on maintenance page */}
        {!isMaintenancePage && (
          <div className="pt-4 border-t border-blue-700">
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left rounded hover:bg-red-600 transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

// Staff Layout component
const StaffLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

// Page Not Found component
const NotFound = () => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
    <div className="w-24 h-24 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
      <span className="text-4xl text-slate-400">🔍</span>
    </div>
    <h2 className="text-2xl font-bold text-slate-200 mb-2">Page Not Found</h2>
    <p className="text-slate-400">The page you're looking for doesn't exist.</p>
  </div>
);

// Main App component
function App() {
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
      <ScrollToTop />
      <ChatBot />
      <Routes>
        {/* Passenger Routes */}
        <Route path="/" element={<PassengerHome />} />
        <Route path="/login" element={<PassengerLogin />} />
        <Route path="/email-verify" element={<PassengerEmailVerify />} />
        <Route path="/reset-password" element={<PassengerRestPassword />} />
        <Route path="/journeys" element={<PassengerJourney />} />
        <Route path="aboutus" element={<PassengerAboutus />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/journeys/checkout" element={<PassengerCheckout />} />
        <Route path="/faqs" element={<PassengerFaqs />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          }
        />
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

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route
          path="/dashboard-admin"
          element={
            <ProtectedAdminRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/parts"
          element={
            <ProtectedAdminRoute>
              <Layout>
                <PartsPage />
              </Layout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedAdminRoute>
              <Layout>
                <MaintenancePage />
              </Layout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/fuel"
          element={
            <ProtectedAdminRoute>
              <Layout>
                <FuelPage />
              </Layout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedAdminRoute>
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedAdminRoute>
          }
        />

        {/* Staff Management Routes */}
        <Route
          path="/dashboardhirun"
          element={
            <StaffLayout>
              <DashboardHirun />
            </StaffLayout>
          }
        />
        <Route
          path="/staff"
          element={
            <StaffLayout>
              <Staff />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/create"
          element={
            <StaffLayout>
              <CreateStaffPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/edit/:staffId"
          element={
            <StaffLayout>
              <CreateStaffPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/list"
          element={
            <StaffLayout>
              <StaffListPage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <StaffLayout>
              <StaffProfilePage />
            </StaffLayout>
          }
        />
        <Route
          path="/staff/assign"
          element={
            <StaffLayout>
              <AssignStaffPage />
            </StaffLayout>
          }
        />
        <Route
          path="/attendance"
          element={
            <StaffLayout>
              <AttendancePage />
            </StaffLayout>
          }
        />
        <Route
          path="/payroll"
          element={
            <StaffLayout>
              <PayrollPage />
            </StaffLayout>
          }
        />
        {/* --- START: Finance Management Routes --- */}
        <Route
          path="/finance-dashboard"
          element={
            <ProtectedAdminRoute>
              <FinanceLayout>
                <FinanceDashboardPage />
              </FinanceLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/finance/budgets"
          element={
            <ProtectedAdminRoute>
              <FinanceLayout>
                <BudgetsPage />
              </FinanceLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/finance/payroll"
          element={
            <ProtectedAdminRoute>
              {/* Note: PayrollPage is already defined for Staff. 
                   We are using PayRollPageFinance for the Finance module's payroll view. */}
              <FinanceLayout>
                <PayRollPageFinance />
              </FinanceLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/finance/loans"
          element={
            <ProtectedAdminRoute>
              <FinanceLayout>
                <LoansPage />
              </FinanceLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/finance/advance"
          element={
            <ProtectedAdminRoute>
              <FinanceLayout>
                <AdvancePage />
              </FinanceLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/salary-form/:salaryId?" // Optional ID parameter for Update/Edit
          element={
            
              <FinanceLayout>
                <SalaryForm />
              </FinanceLayout>
            
          }
        />

        {/* NEW: Salary Slip View Route - Used to display the slip */}
        <Route
          path="/salary-slip-view" 
          element={
            <ProtectedAdminRoute>
              <FinanceLayout>
                <SalarySlipView />
              </FinanceLayout>
            </ProtectedAdminRoute>
          }
        />

        {/* --- END: Finance Management Routes --- */}

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
