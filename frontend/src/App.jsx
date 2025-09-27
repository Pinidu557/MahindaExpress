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
import { AppContent } from "../context/AppContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { isLoggedin } = useContext(AppContent);
  return (
    <>
      <Routes>
        {/* Admin login page - public */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected routes */}
        <Route
          path="/"
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
