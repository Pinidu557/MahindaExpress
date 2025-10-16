import React, { useState, useEffect, useContext } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData } = useContext(AppContent);
  const [activeTab, setActiveTab] = useState("profile");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });

  // Load user data and booking history on component mount
  useEffect(() => {
    // Set initial profile data
    setUserProfile({
      firstname: userData.firstname || "",
      lastname: userData.lastname || "",
      email: userData.email || "",
    });

    // Fetch booking history
    const fetchBookingHistory = async () => {
      try {
        setBookingsLoading(true);
        console.log("Current userData:", userData);
        console.log("Current user ID:", userData._id);
        console.log(
          "Attempting to fetch bookings from:",
          `${backendUrl}/api/bookings/user`
        );

        // Ensure credentials are sent with the request
        axios.defaults.withCredentials = true;

        // Use the /api/bookings/user endpoint which uses the token for authentication
        const { data } = await axios.get(`${backendUrl}/api/bookings/user`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log("API Response:", data);

        if (data && data.success && Array.isArray(data.bookings)) {
          console.log("Bookings received:", data.bookings);
          setBookingHistory(data.bookings);
        } else if (data && data.success) {
          console.log("Bookings received but not an array:", data.bookings);
          setBookingHistory(Array.isArray(data.bookings) ? data.bookings : []);
        } else {
          console.error("API returned failure or invalid format:", data);
          toast.error(data.message || "Failed to load booking history");
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          const errorMessage = error.response.data?.message || "Server error";
          console.error(`Error message: ${errorMessage}`);
          toast.error(`Failed to load booking history: ${errorMessage}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error(
            "Request made but no response received:",
            error.request
          );
          toast.error("No response from server. Please check your connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error setting up request:", error.message);
          toast.error("Failed to set up request");
        }
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookingHistory();
  }, [userData, backendUrl, navigate]);

  // Handle input change for profile form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile update form submission
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      axios.defaults.withCredentials = true;
      // Only send firstname and lastname as those are the only fields the backend expects
      const profileData = {
        firstname: userProfile.firstname,
        lastname: userProfile.lastname,
      };

      // Use the correct endpoint path: /api/user/profile (singular 'user')
      const { data } = await axios.put(
        `${backendUrl}/api/user/profile`,
        profileData
      );

      if (data.success) {
        setUserData({ ...userData, ...profileData });
        toast.success("Profile updated successfully");
        setEditMode(false);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PassengerNavbar />

      <div className="container mx-auto px-4 pt-24 pb-12 w-[92%] mt-15 mb-25">
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/4 bg-slate-700">
              <div className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-600 mx-auto flex items-center justify-center text-3xl font-bold mb-3">
                  {userData?.firstname?.[0]?.toUpperCase() || "U"}
                </div>
                <h2 className="text-xl font-semibold">
                  {userData?.firstname} {userData?.lastname}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{userData?.email}</p>
              </div>

              <nav className="px-4 pb-6">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 w-full text-left p-3 rounded-lg mb-2 cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-indigo-600"
                      : "hover:bg-slate-600"
                  }`}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`flex items-center gap-3 w-full text-left p-3 rounded-lg mb-2 cursor-pointer ${
                    activeTab === "bookings"
                      ? "bg-indigo-600"
                      : "hover:bg-slate-600"
                  }`}
                >
                  <Clock size={18} />
                  <span>Booking History</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="md:w-3/4 p-6 mt-5">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <User size={16} />
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setUserProfile({
                            firstname: userData.firstname || "",
                            lastname: userData.lastname || "",
                            email: userData.email || "",
                          });
                        }}
                        className="text-red-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstname"
                            value={userProfile.firstname}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastname"
                            value={userProfile.lastname}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={userProfile.email}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg cursor-not-allowed opacity-70"
                          disabled
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Email address cannot be changed
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-slate-700 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                          <p className="text-sm text-slate-400">First Name</p>
                          <p className="font-medium">{userData?.firstname}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Last Name</p>
                          <p className="font-medium">{userData?.lastname}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">
                            Email Address
                          </p>
                          <p className="font-medium">{userData?.email}</p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">
                            Account Status
                          </p>
                          <div className="flex items-center mt-1">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                userData?.isAccountVerified
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                            ></span>
                            <span>
                              {userData?.isAccountVerified
                                ? "Verified"
                                : "Not Verified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bookings History Tab */}
              {activeTab === "bookings" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Booking History</h1>

                  {bookingsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : bookingHistory && bookingHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-600">
                        <thead className="bg-slate-700">
                          <tr>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                            >
                              Booking ID
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                            >
                              Route
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                            >
                              Journey Date
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                            >
                              Seats
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                          {bookingHistory.map((booking) => (
                            <tr
                              key={booking._id}
                              className="hover:bg-slate-750"
                            >
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {booking._id.toString
                                  ? booking._id.toString().substring(0, 8)
                                  : booking._id}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {booking.boardingPoint} to{" "}
                                {booking.dropoffPoint}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {formatDate(booking.journeyDate)}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                {booking.seats?.join(", ") || "N/A"}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                LKR {booking.totalFare}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    booking.status === "paid"
                                      ? "bg-green-900 text-green-300"
                                      : booking.status === "confirmed"
                                      ? "bg-blue-900 text-blue-300"
                                      : booking.status === "pending"
                                      ? "bg-orange-700 text-white"
                                      : booking.status === "rejected"
                                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                                      : booking.status === "cancelled"
                                      ? "bg-red-800 text-white"
                                      : "bg-yellow-900 text-yellow-300"
                                  }`}
                                >
                                  {booking.status?.charAt(0).toUpperCase() +
                                    booking.status?.slice(1) || "Pending"}
                                </span>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() =>
                                    navigate(`/booking/${booking._id}`)
                                  }
                                  className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-700 rounded-lg p-12 text-center flex flex-col items-center">
                      <p className="text-slate-300 mb-4">
                        You haven't made any bookings yet.
                      </p>
                      <button
                        onClick={() => navigate("/journeys")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium"
                      >
                        Book a Journey
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PassengerDashboard;
