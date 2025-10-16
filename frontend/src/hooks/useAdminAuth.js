import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import { 
  getAdminToken, 
  getAdminData, 
  clearAdminAuth, 
  isAdminAuthenticated 
} from "../utils/adminAuth";

export const useAdminAuth = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      if (isAdminAuthenticated()) {
        const data = getAdminData();
        setAdminData(data);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${backendUrl || "http://localhost:4000"}/api/admin-mahinda/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        setAdminData(data.admin);
        toast.success("Login successful!");
        return { success: true, admin: data.admin };
      } else {
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
      return { success: false, message: "Network error" };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = getAdminToken();
      if (token) {
        // Call logout API
        await fetch(`${backendUrl || "http://localhost:4000"}/api/admin-mahinda/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      clearAdminAuth();
      setAdminData(null);
      toast.success("Logged out successfully");
      navigate("/admin/login");
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return isAdminAuthenticated() && adminData;
  };

  return {
    adminData,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };
};
