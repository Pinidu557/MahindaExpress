import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import api from "../lib/api"; // Import the API client
import {
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Search,
  Download,
  Clock,
  AlertCircle,
  Trash2,
  Mail,
  UserCheck,
  UserX,
  FileText,
  CalendarClock,
  MapPin,
  User,
  Bus,
  Calendar,
  CreditCard,
} from "lucide-react";

const UserManagement = () => {
  const { backendUrl } = useContext(AppContent); // We still need backendUrl for image paths
  const [activeTab, setActiveTab] = useState("users");
  const [bankTransfers, setBankTransfers] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [refundStatusFilter, setRefundStatusFilter] = useState("all");

  // Function to handle custom date change with validation
  const handleCustomDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split("T")[0];

    // If selected date is in the future, don't update the state
    if (selectedDate > today) {
      return; // Don't allow future dates
    }

    setCustomDate(selectedDate);
  };
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBankTransfers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/api/admin/bank-transfers");
      if (data.success) {
        setBankTransfers(data.bankTransfers);
      }
    } catch (error) {
      console.error("Error fetching bank transfers:", error);
      toast.error("Failed to load bank transfers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Using the all bookings endpoint for admin view
      console.log("Calling API endpoint: /api/bookings/all");
      const { data } = await api.get("/api/bookings/all");
      console.log("API Response:", data);
      console.log("Fetched bookings:", data.bookings?.length, "bookings");
      console.log(
        "Booking statuses:",
        data.bookings?.map((b) => b.status)
      );
      console.log("All booking data:", data.bookings);
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(
        "Failed to load bookings: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all bookings and filter for cancelled ones with refund details
      const { data } = await api.get("/api/bookings/all");
      if (data.success) {
        const cancelledBookings = data.bookings.filter(
          (booking) =>
            booking.status === "cancelled" && booking.cancellationDetails
        );
        setRefunds(cancelledBookings);
      } else {
        toast.error(data.message || "Failed to fetch refunds");
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error(
        "Failed to load refunds: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/api/auth/all-users?page=${page}&limit=10`
      );
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "bank-transfers") {
      fetchBankTransfers();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "bookings") {
      fetchBookings();
    } else if (activeTab === "refunds") {
      fetchRefunds();
    }
  }, [activeTab, fetchBankTransfers, fetchUsers, fetchBookings, fetchRefunds]);

  const handleApproveTransfer = async (bookingId) => {
    try {
      const { data } = await api.put(
        `/api/admin/approve-bank-transfer/${bookingId}`
      );
      if (data.success) {
        toast.success("Bank transfer approved successfully!");
        fetchBankTransfers(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to approve transfer");
      }
    } catch (error) {
      console.error("Error approving transfer:", error);
      toast.error("Failed to approve bank transfer");
    }
  };

  const handleRejectTransfer = async (bookingId, reason = "") => {
    try {
      const { data } = await api.put(
        `/api/admin/reject-bank-transfer/${bookingId}`,
        { reason }
      );
      if (data.success) {
        toast.success("Bank transfer rejected");
        fetchBankTransfers(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to reject transfer");
      }
    } catch (error) {
      console.error("Error rejecting transfer:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reject bank transfer";
      toast.error(errorMessage);
    }
  };

  const viewReceipt = (transfer) => {
    setSelectedReceipt(transfer);
    setShowReceiptModal(true);
  };

  // Handle refund processing
  const handleProcessRefund = async (bookingId, status) => {
    try {
      const { data } = await api.put(`/api/bookings/${bookingId}/refund`, {
        refundStatus: status,
        processedAt: new Date(),
        processedBy: "Admin", // In real app, get from auth context
      });

      if (data.success) {
        toast.success(`Refund marked as ${status}`);
        fetchRefunds(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update refund status");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    }
  };

  // View refund details
  const viewRefundDetails = (refund) => {
    // For now, just show an alert with details
    // In a real app, you might want to open a modal
    const details = `
Booking ID: ${refund._id}
Customer: ${refund.passengerName}
Email: ${refund.email}
Amount: LKR ${refund.totalFare}
Bank: ${refund.cancellationDetails?.refundDetails?.bankName}
Account: ${refund.cancellationDetails?.refundDetails?.accountNumber}
Reason: ${refund.cancellationDetails?.reason}
Status: ${refund.cancellationDetails?.refundStatus}
    `;
    alert(details);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const deleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Set deleting state for animation
      setDeletingUserId(userId);

      await api.delete(`/api/user/${userId}`);

      // Wait for animation to complete before removing from list
      setTimeout(() => {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
        setDeletingUserId(null);
        toast.success("User account deleted successfully");
      }, 300); // Animation duration
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeletingUserId(null);
      toast.error("Failed to delete user account");
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount?.toLocaleString() || 0}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_verification: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Pending Verification",
      },
      paid: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Rejected",
      },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
      text: status,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Filter bank transfers based on search and status
  const filteredBankTransfers = bankTransfers.filter((transfer) => {
    const matchesSearch =
      transfer.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer._id.toString().includes(searchTerm) ||
      transfer.bankTransferDetails?.transactionReference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || transfer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="w-[90%] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-400">
            Manage users and approve bank transfer payments
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 ">
          <nav className="flex justify-between items-center border-b border-gray-700">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${
                  activeTab === "users"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <Users className="inline w-4 h-4 mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab("bank-transfers")}
                className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${
                  activeTab === "bank-transfers"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <Building2 className="inline w-4 h-4 mr-2" />
                Bank Transfer Approvals
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${
                  activeTab === "bookings"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <CalendarClock className="inline w-4 h-4 mr-2" />
                User Bookings
              </button>
              <button
                onClick={() => setActiveTab("refunds")}
                className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${
                  activeTab === "refunds"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <CreditCard className="inline w-4 h-4 mr-2" />
                Refund Management
              </button>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-3 py-2 bg-slate-700 hover:bg-red-500 text-white font-medium rounded-lg transition-colors duration-200 text-sm mb-2"
            >
              Main Dashboard
            </Link>
          </nav>
        </div>

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User List</h2>
              <div className="flex gap-4">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* Filter dropdown */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Users</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="active">Currently Active</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-400">Loading users...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Login Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-gray-700">
                    {users
                      .filter((user) => {
                        // Filter by search term
                        const matchesSearch =
                          searchTerm === "" ||
                          user.firstName
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          user.lastName
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          user.email
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase());

                        // Filter by status
                        let matchesStatus = true;
                        if (userStatusFilter === "verified") {
                          matchesStatus = user.isAccountVerified === true;
                        } else if (userStatusFilter === "unverified") {
                          matchesStatus = user.isAccountVerified === false;
                        } else if (userStatusFilter === "active") {
                          matchesStatus = user.isLoggedIn === true;
                        }

                        return matchesSearch && matchesStatus;
                      })
                      .map((user) => (
                        <tr
                          key={user._id}
                          className={`hover:bg-slate-700 transition-all duration-300 ${
                            deletingUserId === user._id
                              ? "opacity-0 scale-95 transform -translate-x-4"
                              : "opacity-100 scale-100 transform translate-x-0"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isAccountVerified ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-900 text-green-300 shadow-sm">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-amber-900 text-amber-300 shadow-sm">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Not Verified
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isLoggedIn ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <UserX className="w-3 h-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex space-x-2">
                              <button
                                className="text-blue-500 hover:text-blue-400 cursor-pointer"
                                onClick={() => viewUserDetails(user)}
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                className={`${
                                  deletingUserId === user._id
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-500 hover:text-red-400 cursor-pointer"
                                } transition-colors duration-200`}
                                onClick={() => deleteUser(user._id)}
                                disabled={deletingUserId === user._id}
                                title={
                                  deletingUserId === user._id
                                    ? "Deleting..."
                                    : "Delete User"
                                }
                              >
                                <Trash2
                                  className={`w-5 h-5 ${
                                    deletingUserId === user._id
                                      ? "animate-pulse"
                                      : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="mt-6 flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Showing page {currentPage} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchUsers(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-slate-700 text-white hover:bg-slate-600"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        fetchUsers(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-slate-700 text-white hover:bg-slate-600"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No users found.</p>
                <p className="text-sm mt-2">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* User Bookings Tab Content */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">User Bookings</h2>
                <div className="flex gap-4">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by BookingID"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {/* Booking Status Filter */}
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Bookings</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {/* Date Filter */}
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="custom">Custom Date</option>
                  </select>
                  {/* Custom Date Input */}
                  {dateFilter === "custom" && (
                    <div className="flex flex-col">
                      <input
                        type="date"
                        value={customDate}
                        onChange={handleCustomDateChange}
                        max={new Date().toISOString().split("T")[0]}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-400">Loading bookings...</p>
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings
                    .filter((booking) => {
                      // Search filter
                      const matchesSearch =
                        searchTerm === "" ||
                        booking.passengerName
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        booking._id?.toString().includes(searchTerm) ||
                        booking.boardingPoint
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        booking.dropoffPoint
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase());

                      // Status filter
                      const matchesStatus =
                        bookingStatusFilter === "all" ||
                        booking.status === bookingStatusFilter;

                      // Date filter
                      const matchesDate = (() => {
                        if (dateFilter === "all") return true;

                        const bookingDate = new Date(
                          booking.createdAt || booking.journeyDate
                        );
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);

                        // Reset time to start of day for comparison
                        const bookingDateOnly = new Date(
                          bookingDate.getFullYear(),
                          bookingDate.getMonth(),
                          bookingDate.getDate()
                        );
                        const todayOnly = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          today.getDate()
                        );
                        const yesterdayOnly = new Date(
                          yesterday.getFullYear(),
                          yesterday.getMonth(),
                          yesterday.getDate()
                        );

                        if (dateFilter === "today") {
                          return (
                            bookingDateOnly.getTime() === todayOnly.getTime()
                          );
                        } else if (dateFilter === "yesterday") {
                          return (
                            bookingDateOnly.getTime() ===
                            yesterdayOnly.getTime()
                          );
                        } else if (dateFilter === "custom" && customDate) {
                          // Parse custom date and create date object for comparison
                          const [year, month, day] = customDate
                            .split("-")
                            .map(Number);
                          const customDateOnly = new Date(year, month - 1, day);

                          // Debug logging
                          console.log("Custom date filter:", {
                            customDate,
                            customDateOnly: customDateOnly.toDateString(),
                            bookingDateOnly: bookingDateOnly.toDateString(),
                            matches:
                              bookingDateOnly.getTime() ===
                              customDateOnly.getTime(),
                          });

                          return (
                            bookingDateOnly.getTime() ===
                            customDateOnly.getTime()
                          );
                        }

                        return true;
                      })();

                      return matchesSearch && matchesStatus && matchesDate;
                    })
                    .sort((a, b) => {
                      // Sort by newest first by default
                      const dateA = new Date(a.createdAt || a.journeyDate);
                      const dateB = new Date(b.createdAt || b.journeyDate);
                      return dateB - dateA;
                    })
                    .map((booking) => (
                      <div
                        key={booking._id}
                        className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-slate-500 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-lg font-semibold text-white">
                                Booking #{booking._id}
                              </h3>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                                  booking.status === "paid"
                                    ? "bg-green-900 text-green-300"
                                    : booking.status === "rejected"
                                    ? "bg-red-900 text-red-300"
                                    : "bg-amber-900 text-amber-300"
                                }`}
                              >
                                {booking.status === "paid" ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : booking.status === "rejected" ? (
                                  <XCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {booking.status === "paid"
                                  ? "Paid"
                                  : booking.status === "rejected"
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex flex-col">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <User className="w-3 h-3" /> Passenger
                                </span>
                                <span className="font-medium">
                                  {booking.passengerName}
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> Route
                                </span>
                                <span className="font-medium">
                                  {booking.boardingPoint} →{" "}
                                  {booking.dropoffPoint}
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Journey Date
                                </span>
                                <span>{formatDate(booking.journeyDate)}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" /> Payment
                                </span>
                                <span
                                  className={`${
                                    booking.status === "paid"
                                      ? "text-green-400"
                                      : booking.status === "rejected"
                                      ? "text-red-400"
                                      : "text-amber-400"
                                  } font-medium`}
                                >
                                  {formatCurrency(booking.totalFare)} •{" "}
                                  {booking.status === "paid"
                                    ? "Paid"
                                    : booking.status === "rejected"
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-2 py-1 bg-slate-800 rounded-md text-xs">
                                <Bus className="w-3 h-3 mr-1 text-indigo-400" />
                                {booking.busType || "Luxury Bus"}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 bg-slate-800 rounded-md text-xs">
                                <User className="w-3 h-3 mr-1 text-indigo-400" />
                                {booking.seats ? booking.seats.length : 1}{" "}
                                {booking.seats && booking.seats.length > 1
                                  ? "Seats"
                                  : "Seat"}
                              </span>
                              {booking.paymentMethod && (
                                <span className="inline-flex items-center px-2 py-1 bg-slate-800 rounded-md text-xs">
                                  <CreditCard className="w-3 h-3 mr-1 text-indigo-400" />
                                  {booking.paymentMethod}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 md:ml-4 flex items-start">
                            <button
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              onClick={() => {
                                // Handle view booking details
                                toast.info(
                                  "Booking details feature coming soon"
                                );
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CalendarClock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No bookings found.</p>
                  <p className="text-sm mt-2">
                    Try adjusting your search or check back later.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bank Transfers Tab Content */}
        {activeTab === "bank-transfers" && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by booking ID, passenger name, or transaction reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending_verification">
                      Pending Verification
                    </option>
                    <option value="paid">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Bank Transfers List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-400">
                    Loading bank transfers...
                  </p>
                </div>
              ) : filteredBankTransfers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No bank transfers found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBankTransfers.map((transfer) => (
                    <div
                      key={transfer._id}
                      className="bg-slate-700 rounded-lg p-6 border border-slate-600"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-white">
                              Booking #{transfer._id}
                            </h3>
                            {getStatusBadge(transfer.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Passenger Name</p>
                              <p className="text-white font-medium">
                                {transfer.passengerName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Route</p>
                              <p className="text-white">
                                {transfer.boardingPoint} →{" "}
                                {transfer.dropoffPoint}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Amount</p>
                              <p className="text-white font-medium">
                                {formatCurrency(transfer.totalFare)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Journey Date</p>
                              <p className="text-white">
                                {formatDate(transfer.journeyDate)}
                              </p>
                            </div>
                            {transfer.bankTransferDetails && (
                              <>
                                <div>
                                  <p className="text-gray-400">
                                    Transaction Reference
                                  </p>
                                  <p className="text-white font-mono">
                                    {
                                      transfer.bankTransferDetails
                                        .transactionReference
                                    }
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Payer Name</p>
                                  <p className="text-white">
                                    {transfer.bankTransferDetails.payerName}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Payment Date</p>
                                  <p className="text-white">
                                    {formatDate(
                                      transfer.bankTransferDetails.paymentDate
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Uploaded</p>
                                  <p className="text-white">
                                    {formatDate(
                                      transfer.bankTransferDetails.uploadedAt
                                    )}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:w-48">
                          <button
                            onClick={() => viewReceipt(transfer)}
                            className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Receipt
                          </button>

                          {transfer.status === "pending_verification" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApproveTransfer(transfer._id)
                                }
                                className="flex items-center justify-center gap-2 px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectTransfer(transfer._id)
                                }
                                className="flex items-center justify-center gap-2 px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Payment Receipt - Booking #{selectedReceipt._id}
                </h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 hover:text-red-700 cursor-pointer"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {selectedReceipt.bankTransferDetails?.receiptPath ? (
                <div className="space-y-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">
                      Transfer Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Transaction Reference</p>
                        <p className="text-white font-mono">
                          {
                            selectedReceipt.bankTransferDetails
                              .transactionReference
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="text-white">
                          {formatCurrency(
                            selectedReceipt.bankTransferDetails.totalAmount
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payer Name</p>
                        <p className="text-white">
                          {selectedReceipt.bankTransferDetails.payerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment Date</p>
                        <p className="text-white">
                          {formatDate(
                            selectedReceipt.bankTransferDetails.paymentDate
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">
                      Receipt Image
                    </h4>
                    <div className="text-center">
                      {selectedReceipt.bankTransferDetails.receiptPath
                        .toLowerCase()
                        .includes(".pdf") ? (
                        <div className="p-8 border-2 border-dashed border-gray-600 rounded-lg">
                          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-400 mb-4">PDF Receipt</p>
                          <a
                            href={`${backendUrl}/${selectedReceipt.bankTransferDetails.receiptPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </a>
                        </div>
                      ) : (
                        <div>
                          <img
                            src={`${backendUrl}/${selectedReceipt.bankTransferDetails.receiptPath}`}
                            alt="Payment Receipt"
                            className="max-w-full h-auto rounded-lg border border-gray-600"
                            onError={(e) => {
                              console.error("Image failed to load:", e);
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/300x200?text=Receipt+Image+Error";
                              // Show error message
                              const errorMsg = document.createElement("p");
                              errorMsg.textContent =
                                "Failed to load receipt image. Please check the file path.";
                              errorMsg.className = "text-red-500 mt-2";
                              e.target.parentNode.appendChild(errorMsg);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No receipt uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  User Details
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-red-700 cursor-pointer"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700 p-6 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p className="text-gray-400 flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      {selectedUser.isAccountVerified ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium bg-teal-500 text-white border border-teal-400 shadow-sm">
                          <UserCheck className="w-4 h-4 mr-1" />
                          Verified Account
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium bg-amber-500 text-white border border-amber-400 shadow-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Login Status</p>
                      <p className="text-white">
                        {selectedUser.isLoggedIn
                          ? "Currently Active"
                          : "Inactive"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">User ID</p>
                      <p className="text-white font-mono text-sm">
                        {selectedUser._id}
                      </p>
                    </div>
                    {selectedUser.createdAt && (
                      <div>
                        <p className="text-gray-400">Registration Date</p>
                        <p className="text-white">
                          {formatDate(selectedUser.createdAt)}
                        </p>
                      </div>
                    )}
                    {selectedUser.updatedAt && (
                      <div>
                        <p className="text-gray-400">Last Updated</p>
                        <p className="text-white">
                          {formatDate(selectedUser.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Management Tab Content */}
      {activeTab === "refunds" && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-[88%] mx-auto -mt-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Refund Management</h2>
              <div className="flex gap-4">
                {/* Refund Status Filter */}
                <select
                  value={refundStatusFilter}
                  onChange={(e) => setRefundStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Refunds</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            ) : refunds.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-400">No refund requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {refunds
                  .filter((refund) => {
                    if (refundStatusFilter === "all") return true;
                    return (
                      refund.cancellationDetails?.refundStatus ===
                      refundStatusFilter
                    );
                  })
                  .map((refund) => (
                    <div
                      key={refund._id}
                      className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-slate-500 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Booking Details */}
                        <div>
                          <h3 className="font-semibold text-white mb-2">
                            Booking Details
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-400">Booking ID:</span>{" "}
                              {refund._id}
                            </p>
                            <p>
                              <span className="text-gray-400">Route:</span>{" "}
                              {refund.boardingPoint} to {refund.dropoffPoint}
                            </p>
                            <p>
                              <span className="text-gray-400">Date:</span>{" "}
                              {formatDate(refund.journeyDate)}
                            </p>
                            <p>
                              <span className="text-gray-400">Amount:</span> LKR{" "}
                              {refund.totalFare}
                            </p>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div>
                          <h3 className="font-semibold text-white mb-2">
                            Customer Details
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-400">Name:</span>{" "}
                              {refund.passengerName}
                            </p>
                            <p>
                              <span className="text-gray-400">Email:</span>{" "}
                              {refund.email}
                            </p>
                            <p>
                              <span className="text-gray-400">Phone:</span>{" "}
                              {refund.mobileNumber}
                            </p>
                          </div>
                        </div>

                        {/* Refund Details */}
                        <div>
                          <h3 className="font-semibold text-white mb-2">
                            Refund Details
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-400">Status:</span>
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                  refund.cancellationDetails?.refundStatus ===
                                  "processed"
                                    ? "bg-green-900 text-green-300"
                                    : refund.cancellationDetails
                                        ?.refundStatus === "failed"
                                    ? "bg-red-900 text-red-300"
                                    : "bg-yellow-900 text-yellow-300"
                                }`}
                              >
                                {refund.cancellationDetails?.refundStatus ||
                                  "pending"}
                              </span>
                            </p>
                            <p>
                              <span className="text-gray-400">Bank:</span>{" "}
                              {
                                refund.cancellationDetails?.refundDetails
                                  ?.bankName
                              }
                            </p>
                            <p>
                              <span className="text-gray-400">Account:</span>{" "}
                              {
                                refund.cancellationDetails?.refundDetails
                                  ?.accountNumber
                              }
                            </p>
                            <p>
                              <span className="text-gray-400">Holder:</span>{" "}
                              {
                                refund.cancellationDetails?.refundDetails
                                  ?.accountHolderName
                              }
                            </p>
                            <p>
                              <span className="text-gray-400">Reason:</span>{" "}
                              {refund.cancellationDetails?.reason}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-4 border-t border-slate-600 flex gap-2">
                        {refund.cancellationDetails?.refundStatus ===
                          "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleProcessRefund(refund._id, "processed")
                              }
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Mark as Processed
                            </button>
                            <button
                              onClick={() =>
                                handleProcessRefund(refund._id, "failed")
                              }
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Mark as Failed
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => viewRefundDetails(refund)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
