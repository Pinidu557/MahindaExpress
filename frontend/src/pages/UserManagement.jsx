import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import api from "../lib/api"; // Import the API client
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Phone } from "lucide-react";
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
  const [routeNameFilter, setRouteNameFilter] = useState("all");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [refundStatusFilter, setRefundStatusFilter] = useState("all");
  const [processingTransfer, setProcessingTransfer] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(null);
  const [generatingRefundReport, setGeneratingRefundReport] = useState(false);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactStatusFilter, setContactStatusFilter] = useState("all");

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
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [bookingsPerPage] = useState(10);

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

  const fetchBookings = useCallback(
    async (page = 1) => {
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
          const allBookings = data.bookings || [];
          setBookings(allBookings);

          // Just set the current page directly without additional calculations
          setCurrentBookingPage(page);
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
    },
    [] // No dependencies needed
  );

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all bookings and filter for cancelled ones with refund details
      const { data } = await api.get("/api/bookings/all");
      if (data.success) {
        const cancelledBookings = data.bookings.filter(
          (booking) =>
            booking.status === "cancelled" &&
            booking.cancellationDetails &&
            // Exclude auto-cancelled pending payments (timeout cancellations)
            !booking.cancellationDetails.reason?.includes(
              "Auto-cancelled due to payment timeout"
            )
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

  // Fetch contact messages data
  const fetchContactMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/contacts");
      if (response.data.success) {
        setContactMessages(response.data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      toast.error("Failed to fetch contact messages");
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
      fetchBookings(currentBookingPage);
    } else if (activeTab === "refunds") {
      fetchRefunds();
    } else if (activeTab === "contact-messages") {
      fetchContactMessages();
    }
  }, [
    activeTab,
    fetchBankTransfers,
    fetchUsers,
    fetchBookings,
    fetchRefunds,
    fetchContactMessages,
    currentBookingPage,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (activeTab === "bookings") {
      setCurrentBookingPage(1);
    }
  }, [
    searchTerm,
    bookingStatusFilter,
    dateFilter,
    customDate,
    routeNameFilter,
    activeTab,
  ]);

  const handleApproveTransfer = async (bookingId) => {
    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to approve this bank transfer?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessingTransfer(bookingId);
    try {
      const { data } = await api.put(
        `/api/admin/approve-bank-transfer/${bookingId}`
      );
      if (data.success) {
        toast.success(`Bank transfer approved successfully!`, {
          duration: 5000,
          position: "top-right",
        });
        fetchBankTransfers(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to approve transfer");
      }
    } catch (error) {
      console.error("Error approving transfer:", error);
      toast.error(" Failed to approve bank transfer. Please try again.");
    } finally {
      setProcessingTransfer(null);
    }
  };

  const handleRejectTransfer = async (bookingId, reason = "") => {
    // Show confirmation dialog
    const transfer = bankTransfers.find((t) => t._id === bookingId);
    const confirmMessage = `Are you sure you want to reject this bank transfer?\n\nTransfer Details:\n• Amount: LKR ${
      transfer?.totalFare || "N/A"
    }\n• Payer: ${
      transfer?.bankTransferDetails?.payerName || "N/A"
    }\n• Reference: ${
      transfer?.bankTransferDetails?.transactionReference || "N/A"
    }`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessingTransfer(bookingId);
    try {
      const { data } = await api.put(
        `/api/admin/reject-bank-transfer/${bookingId}`,
        { reason: reason }
      );
      if (data.success) {
        toast.error(` Bank transfer rejected`, {
          duration: 5000,
          position: "top-right",
        });
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
      toast.error(` ${errorMessage}`);
    } finally {
      setProcessingTransfer(null);
    }
  };

  const viewReceipt = (transfer) => {
    setSelectedReceipt(transfer);
    setShowReceiptModal(true);
  };

  // Handle refund processing
  const handleProcessRefund = async (bookingId, status) => {
    // Show confirmation dialog
    const refund = refunds.find((r) => r._id === bookingId);
    const statusText = status === "processed" ? "approve" : "reject";
    const confirmMessage = `Are you sure you want to ${statusText} this refund?\n\nRefund Details:\n• Amount: LKR ${
      refund?.totalFare || "N/A"
    }\n• Customer: ${refund?.passengerName || "N/A"}\n• Email: ${
      refund?.email || "N/A"
    }\n• Reason: ${refund?.cancellationDetails?.reason || "N/A"}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessingRefund(bookingId);
    try {
      const { data } = await api.put(`/api/bookings/${bookingId}/refund`, {
        refundStatus: status,
        processedAt: new Date(),
        processedBy: "Admin", // In real app, get from auth context
      });

      if (data.success) {
        const successMessage =
          status === "processed"
            ? `Refund approved successfully!\nAmount: LKR ${refund?.totalFare}\nCustomer: ${refund?.passengerName}`
            : ` Refund rejected\nAmount: LKR ${refund?.totalFare}\nCustomer: ${refund?.passengerName}`;

        toast[status === "processed" ? "success" : "error"](successMessage, {
          duration: 5000,
          position: "top-right",
        });
        fetchRefunds(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update refund status");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error(`Failed to process refund. Please try again.`);
    } finally {
      setProcessingRefund(null);
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
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A", error;
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount?.toLocaleString() || 0}`;
  };

  // Generate Refunds Report
  const generateRefundsReport = async () => {
    setGeneratingRefundReport(true);
    try {
      // Check if refunds data is available
      if (!refunds || refunds.length === 0) {
        toast.error("No refunds data available to generate report");
        return;
      }

      const doc = new jsPDF();

      // Title with better styling
      doc.setFontSize(20);
      doc.setTextColor(75, 85, 99); // slate-600
      doc.text("Refunds Report", 14, 22);

      // Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // gray
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Filter refunds based on current filter
      const filteredRefunds = refunds.filter((refund) => {
        if (refundStatusFilter === "all") return true;
        return (
          refund.cancellationDetails?.refundStatus ===
          refundStatusFilter
        );
      });

      // Prepare table columns
      const tableColumns = [
        "Booking ID",
        "Customer Name",
        "Route",
        "Journey Date",
        "Amount (LKR)",
        "Refund Status",
        "Bank Name",
        "Account Number",
        "Reason"
      ];

      // Prepare table rows
      const tableRows = filteredRefunds.map((refund) => [
        String(refund._id).substring(0, 8) + "...", // Truncated booking ID
        refund.passengerName || "N/A",
        `${refund.boardingPoint} → ${refund.dropoffPoint}`,
        formatDate(refund.journeyDate),
        refund.totalFare || 0,
        refund.cancellationDetails?.refundStatus || "pending",
        refund.cancellationDetails?.refundDetails?.bankName || "N/A",
        refund.cancellationDetails?.refundDetails?.accountNumber || "N/A",
        refund.cancellationDetails?.reason || "N/A"
      ]);

      // Add summary statistics
      const totalRefunds = filteredRefunds.length;
      const pendingRefunds = filteredRefunds.filter(r => 
        r.cancellationDetails?.refundStatus === "pending"
      ).length;
      const processedRefunds = filteredRefunds.filter(r => 
        r.cancellationDetails?.refundStatus === "processed"
      ).length;
      const failedRefunds = filteredRefunds.filter(r => 
        r.cancellationDetails?.refundStatus === "failed"
      ).length;
      const totalAmount = filteredRefunds.reduce((sum, refund) => 
        sum + (refund.totalFare || 0), 0
      );

      // Add summary section with better styling
      doc.setFontSize(14);
      doc.setTextColor(75, 85, 99); // slate-600
      doc.text("Summary Statistics", 14, 45);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0); // black
      doc.text(`Total Refunds: ${totalRefunds}`, 14, 55);
      doc.text(`Pending: ${pendingRefunds}`, 14, 63);
      doc.text(`Processed: ${processedRefunds}`, 14, 71);
      doc.text(`Failed: ${failedRefunds}`, 14, 79);
      doc.text(`Total Amount: LKR ${totalAmount.toLocaleString()}`, 14, 87);

      // Add table with better styling
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 95,
        styles: {
          overflow: "linebreak",
          cellWidth: "wrap",
          fontSize: 9,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Booking ID
          1: { cellWidth: 25 }, // Customer Name
          2: { cellWidth: 30 }, // Route
          3: { cellWidth: 20 }, // Journey Date
          4: { cellWidth: 15 }, // Amount
          5: { cellWidth: 15 }, // Status
          6: { cellWidth: 20 }, // Bank Name
          7: { cellWidth: 25 }, // Account Number
          8: { cellWidth: 30 }, // Reason
        },
        headStyles: {
          fillColor: [75, 85, 99], // slate-600
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // slate-50
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleDateString()}`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Save the PDF
      const fileName = `refunds_report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success("Refunds report generated successfully!");
    } catch (error) {
      console.error("Error generating refunds report:", error);
      toast.error("Failed to generate refunds report");
    } finally {
      setGeneratingRefundReport(false);
    }
  };

  // Generate Users Report
  const generateUsersReport = () => {
    try {
      // Check if users data is available
      if (!users || users.length === 0) {
        toast.error("No users data available to generate report");
        return;
      }

      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text("Users Report", 14, 22);

      // Date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Filter info
      let filterInfo = "All Users";
      if (userStatusFilter !== "all") {
        filterInfo = `Filtered by: ${userStatusFilter}`;
      }
      doc.text(filterInfo, 14, 38);

      // Prepare data
      const filteredUsers = users.filter((user) => {
        const matchesSearch =
          searchTerm === "" ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          userStatusFilter === "all" || user.status === userStatusFilter;
        return matchesSearch && matchesStatus;
      });

      // Debug: Log first user to see data structure
      if (filteredUsers.length > 0) {
        console.log("First user data structure:", filteredUsers[0]);
      }

      const tableData = filteredUsers.map((user, index) => [
        index + 1,
        user.name || user.fullName || user.firstName || "N/A",
        user.email || "N/A",
        user.phone || user.phoneNumber || "N/A",
        user.status ||
          user.verificationStatus ||
          (user.isVerified ? "verified" : "unverified") ||
          "N/A",
        formatDate(user.createdAt),
      ]);

      // Check if we have data to display
      if (tableData.length === 0) {
        doc.setFontSize(12);
        doc.text("No users found matching the current filters.", 14, 50);
      } else {
        // Table
        autoTable(doc, {
          head: [["#", "Name", "Email", "Phone", "Status", "Created At"]],
          body: tableData,
          startY: 45,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
      }

      // Summary
      const totalUsers = filteredUsers.length;

      doc.setFontSize(12);
      doc.text("Summary:", 14, doc.lastAutoTable?.finalY + 20 || 100);
      doc.setFontSize(10);
      doc.text(
        `Total Users: ${totalUsers}`,
        14,
        doc.lastAutoTable?.finalY + 30 || 110
      );

      // Save
      doc.save(`users-report-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Users report generated successfully!");
    } catch (error) {
      console.error("Error generating users report:", error);
      toast.error("Failed to generate users report");
    }
  };

  // Generate Bookings Report
  const generateBookingsReport = () => {
    try {
      // Check if bookings data is available
      if (!bookings || bookings.length === 0) {
        toast.error("No bookings data available to generate report");
        return;
      }

      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text("Detailed User Bookings Report", 14, 22);

      // Date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Filter info
      let filterInfo = "All Bookings";
      if (bookingStatusFilter !== "all") {
        filterInfo = `Filtered by: ${bookingStatusFilter}`;
      }
      if (dateFilter !== "all") {
        if (dateFilter === "today") {
          filterInfo += ` | Date: Today (${new Date().toLocaleDateString()})`;
        } else if (dateFilter === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          filterInfo += ` | Date: Yesterday (${yesterday.toLocaleDateString()})`;
        } else if (dateFilter === "custom" && customDate) {
          const customDateObj = new Date(customDate);
          filterInfo += ` | Date: ${customDateObj.toLocaleDateString()}`;
        } else {
          filterInfo += ` | Date: ${dateFilter}`;
        }
      }
      // Add route filter information
      if (routeNameFilter !== "all") {
        filterInfo += ` | Route: ${routeNameFilter}`;
      }
      doc.text(filterInfo, 14, 38);

      // Prepare data
      const filteredBookings = bookings.filter((booking) => {
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

        const matchesStatus =
          bookingStatusFilter === "all" ||
          booking.status === bookingStatusFilter;

        // Route name filter
        const matchesRouteName =
          routeNameFilter === "all" || booking.routeName === routeNameFilter;

        const matchesDate = (() => {
          if (dateFilter === "all") return true;
          const bookingDate = new Date(
            booking.createdAt || booking.journeyDate
          );
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

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
            return bookingDateOnly.getTime() === todayOnly.getTime();
          } else if (dateFilter === "yesterday") {
            return bookingDateOnly.getTime() === yesterdayOnly.getTime();
          } else if (dateFilter === "custom" && customDate) {
            const [year, month, day] = customDate.split("-").map(Number);
            const customDateOnly = new Date(year, month - 1, day);
            return bookingDateOnly.getTime() === customDateOnly.getTime();
          }
          return true;
        })();

        return (
          matchesSearch && matchesStatus && matchesDate && matchesRouteName
        );
      });

      const tableData = filteredBookings.map((booking, index) => [
        index + 1,
        booking.passengerName || "N/A",
        booking._id
          ? typeof booking._id === "string"
            ? booking._id.substring(0, 8) + "..."
            : String(booking._id).substring(0, 8) + "..."
          : "N/A",
        booking.routeName || "N/A",
        booking.boardingPoint || "N/A",
        booking.dropoffPoint || "N/A",
        booking.routeNumber || "N/A",
        booking.status || "N/A",
        formatCurrency(booking.totalFare),
        formatDate(booking.journeyDate || booking.createdAt),
      ]);

      // Check if we have data to display
      if (tableData.length === 0) {
        doc.setFontSize(12);
        doc.text("No bookings found matching the current filters.", 14, 50);
      } else {
        // Table
        autoTable(doc, {
          head: [
            [
              "#",
              "Passenger",
              "Booking ID",
              "Route Name",
              "Boarding Point",
              "Drop-off Point",
              "Route #",
              "Status",
              "Amount",
              "Date",
            ],
          ],
          body: tableData,
          startY: 45,
          styles: { fontSize: 7 }, // Reduced font size to fit more columns
          headStyles: { fillColor: [59, 130, 246] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: {
            0: { cellWidth: 8 }, // # column
            1: { cellWidth: 25 }, // Passenger column
            2: { cellWidth: 20 }, // Booking ID column
            3: { cellWidth: 25 }, // Route Name column
            4: { cellWidth: 25 }, // Boarding Point column
            5: { cellWidth: 25 }, // Drop-off Point column
          },
        });
      }

      // Summary
      const totalBookings = filteredBookings.length;
      const paidBookings = filteredBookings.filter(
        (b) => b.status === "paid"
      ).length;
      const pendingBookings = filteredBookings.filter(
        (b) => b.status === "pending"
      ).length;
      const cancelledBookings = filteredBookings.filter(
        (b) => b.status === "cancelled"
      ).length;
      const totalRevenue = filteredBookings
        .filter((b) => b.status === "paid")
        .reduce((sum, b) => sum + (b.totalFare || 0), 0);

      // Date range information
      let dateRangeInfo = "";
      if (filteredBookings.length > 0) {
        const dates = filteredBookings
          .map((b) => new Date(b.journeyDate || b.createdAt))
          .filter((d) => !isNaN(d.getTime()))
          .sort((a, b) => a - b);

        if (dates.length > 0) {
          const earliestDate = dates[0];
          const latestDate = dates[dates.length - 1];

          if (earliestDate.getTime() === latestDate.getTime()) {
            dateRangeInfo = `Date Range: ${earliestDate.toLocaleDateString()}`;
          } else {
            dateRangeInfo = `Date Range: ${earliestDate.toLocaleDateString()} - ${latestDate.toLocaleDateString()}`;
          }
        }
      }

      doc.setFontSize(12);
      doc.text("Summary:", 14, doc.lastAutoTable?.finalY + 20 || 100);
      doc.setFontSize(10);
      doc.text(
        `Total Bookings: ${totalBookings}`,
        14,
        doc.lastAutoTable?.finalY + 30 || 110
      );
      doc.text(
        `Paid Bookings: ${paidBookings}`,
        14,
        doc.lastAutoTable?.finalY + 40 || 120
      );
      doc.text(
        `Pending Bookings: ${pendingBookings}`,
        14,
        doc.lastAutoTable?.finalY + 50 || 130
      );
      doc.text(
        `Cancelled Bookings: ${cancelledBookings}`,
        14,
        doc.lastAutoTable?.finalY + 60 || 140
      );
      doc.text(
        `Total Revenue: ${formatCurrency(totalRevenue)}`,
        14,
        doc.lastAutoTable?.finalY + 70 || 150
      );

      if (dateRangeInfo) {
        doc.text(dateRangeInfo, 14, doc.lastAutoTable?.finalY + 80 || 160);
      }

      // Add route-specific information if a specific route is selected
      if (routeNameFilter !== "all") {
        doc.text(
          `Route: ${routeNameFilter}`,
          14,
          doc.lastAutoTable?.finalY + 90 || 170
        );

        // Calculate route-specific metrics
        const routeRevenue = filteredBookings
          .filter((b) => b.status === "paid")
          .reduce((sum, b) => sum + (b.totalFare || 0), 0);

        doc.text(
          `Route Total Revenue: ${formatCurrency(routeRevenue)}`,
          14,
          doc.lastAutoTable?.finalY + 100 || 180
        );
      }

      // Save with date-specific and route-specific filename
      let filename = `bookings-report-${
        new Date().toISOString().split("T")[0]
      }`;
      if (dateFilter !== "all") {
        if (dateFilter === "today") {
          filename += "-today";
        } else if (dateFilter === "yesterday") {
          filename += "-yesterday";
        } else if (dateFilter === "custom" && customDate) {
          filename += `-${customDate}`;
        } else {
          filename += `-${dateFilter}`;
        }
      }

      // Add route name to filename if a specific route is selected
      if (routeNameFilter !== "all") {
        // Replace spaces and special characters in route name for a valid filename
        const routeFilename = routeNameFilter
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase();
        filename += `-route-${routeFilename}`;
      }
      doc.save(`${filename}.pdf`);
      toast.success("Bookings report generated successfully!");
    } catch (error) {
      console.error("Error generating bookings report:", error);
      toast.error("Failed to generate bookings report");
    }
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
              <button
                onClick={() => setActiveTab("contact-messages")}
                className={`py-2 px-1 border-b-2 font-medium cursor-pointer text-sm ${
                  activeTab === "contact-messages"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <Mail className="inline w-4 h-4 mr-2" />
                Contact Messages
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
                {/* Generate Report Button */}
                <button
                  onClick={generateUsersReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
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
                  {/* Generate Report Button */}
                  <button
                    onClick={generateBookingsReport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
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
                    <option value="cancelled">Cancelled</option>
                    <option value="pending_verification">
                      Pending Verification
                    </option>
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
                  {/* Route Name Filter */}
                  <select
                    value={routeNameFilter}
                    onChange={(e) => setRouteNameFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Routes</option>
                    {(() => {
                      // Get unique route names from bookings
                      const uniqueRoutes = [
                        ...new Set(
                          bookings
                            .filter((booking) => booking.routeName)
                            .map((booking) => booking.routeName)
                        ),
                      ].sort();

                      return uniqueRoutes.map((routeName) => (
                        <option key={routeName} value={routeName}>
                          {routeName}
                        </option>
                      ));
                    })()}
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
                  {(() => {
                    // Filter and sort bookings
                    console.log(
                      "Total bookings before filtering:",
                      bookings.length
                    );
                    console.log("Current route filter:", routeNameFilter);

                    const filteredBookings = bookings
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
                            const customDateOnly = new Date(
                              year,
                              month - 1,
                              day
                            );

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

                        // Route name filter
                        // When "all" is selected, show all bookings regardless of route
                        // When specific route is selected, only show bookings with that route
                        const matchesRouteName =
                          routeNameFilter === "all" ||
                          booking.routeName === routeNameFilter;

                        return (
                          matchesSearch &&
                          matchesStatus &&
                          matchesDate &&
                          matchesRouteName
                        );
                      })
                      .sort((a, b) => {
                        // Sort by newest first (changed priority to show latest bookings on first page)
                        const dateA = new Date(a.createdAt || a.journeyDate);
                        const dateB = new Date(b.createdAt || b.journeyDate);

                        // Compare dates first (newest bookings first)
                        if (dateA.getTime() !== dateB.getTime()) {
                          return dateB - dateA; // Newest bookings first
                        }

                        // If dates are the same, then sort by route name
                        const routeNameA = a.routeName || "";
                        const routeNameB = b.routeName || "";
                        return routeNameA.localeCompare(routeNameB);
                      });

                    // Calculate pagination
                    console.log(
                      "Bookings sorted by newest first, showing on first page"
                    );
                    const totalFilteredBookings = filteredBookings.length;
                    // Using SCREAMING_SNAKE_CASE to satisfy ESLint rule
                    const TOTAL_PAGES = Math.ceil(
                      totalFilteredBookings / bookingsPerPage
                    );

                    // Get current page bookings
                    const startIndex =
                      (currentBookingPage - 1) * bookingsPerPage;
                    const endIndex = startIndex + bookingsPerPage;
                    const currentBookings = filteredBookings.slice(
                      startIndex,
                      endIndex
                    );

                    console.log(
                      "Filtered bookings count:",
                      filteredBookings.length
                    );

                    return (
                      <>
                        {currentBookings.map((booking) => (
                          <div
                            key={booking._id}
                            className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-slate-500 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold text-white">
                                      Booking #{booking._id}
                                    </h3>
                                    {booking.routeName && (
                                      <div className="text-sm text-gray-300 mt-1">
                                        {booking.routeName}
                                      </div>
                                    )}
                                    {booking.routeNumber && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        Route #{booking.routeNumber}
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                                      booking.status === "paid"
                                        ? "bg-green-900 text-green-300"
                                        : booking.status === "rejected"
                                        ? "bg-red-900 text-red-300"
                                        : booking.status === "cancelled"
                                        ? "bg-red-900 text-red-300"
                                        : booking.status ===
                                          "pending_verification"
                                        ? "bg-yellow-900 text-yellow-300"
                                        : "bg-amber-900 text-amber-300"
                                    }`}
                                  >
                                    {booking.status === "paid" ? (
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                    ) : booking.status === "rejected" ? (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    ) : booking.status === "cancelled" ? (
                                      <XCircle className="w-3 h-3 mr-1" />
                                    ) : booking.status ===
                                      "pending_verification" ? (
                                      <Clock className="w-3 h-3 mr-1" />
                                    ) : (
                                      <Clock className="w-3 h-3 mr-1" />
                                    )}
                                    {booking.status === "paid"
                                      ? "Paid"
                                      : booking.status === "rejected"
                                      ? "Rejected"
                                      : booking.status === "cancelled"
                                      ? "Cancelled"
                                      : booking.status ===
                                        "pending_verification"
                                      ? "Pending Verification"
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
                                      <Calendar className="w-3 h-3" /> Journey
                                      Date
                                    </span>
                                    <span>
                                      {formatDate(booking.journeyDate)}
                                    </span>
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
                                          : booking.status === "cancelled"
                                          ? "text-red-400"
                                          : booking.status ===
                                            "pending_verification"
                                          ? "text-yellow-400"
                                          : "text-amber-400"
                                      } font-medium`}
                                    >
                                      {formatCurrency(booking.totalFare)} •{" "}
                                      {booking.status === "paid"
                                        ? "Paid"
                                        : booking.status === "rejected"
                                        ? "Rejected"
                                        : booking.status === "cancelled"
                                        ? "Cancelled"
                                        : booking.status ===
                                          "pending_verification"
                                        ? "Pending Verification"
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

                        {/* Pagination Controls */}
                        {TOTAL_PAGES > 1 && (
                          <div className="mt-6 flex justify-between items-center">
                            <p className="text-sm text-gray-400">
                              Showing page {currentBookingPage} of {TOTAL_PAGES}
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  setCurrentBookingPage(
                                    Math.max(1, currentBookingPage - 1)
                                  )
                                }
                                disabled={currentBookingPage === 1}
                                className={`px-4 py-2 rounded-md ${
                                  currentBookingPage === 1
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-slate-700 text-white hover:bg-slate-600"
                                }`}
                              >
                                Previous
                              </button>
                              <button
                                onClick={() =>
                                  setCurrentBookingPage(
                                    Math.min(
                                      TOTAL_PAGES,
                                      currentBookingPage + 1
                                    )
                                  )
                                }
                                disabled={currentBookingPage === TOTAL_PAGES}
                                className={`px-4 py-2 rounded-md ${
                                  currentBookingPage === TOTAL_PAGES
                                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                    : "bg-slate-700 text-white hover:bg-slate-600"
                                }`}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
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
                                disabled={processingTransfer === transfer._id}
                                className={`flex items-center justify-center gap-2 px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${
                                  processingTransfer === transfer._id
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {processingTransfer === transfer._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectTransfer(transfer._id)
                                }
                                disabled={processingTransfer === transfer._id}
                                className={`flex items-center justify-center gap-2 px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${
                                  processingTransfer === transfer._id
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {processingTransfer === transfer._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </>
                                )}
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
                
                {/* Generate Report Button */}
                <button
                  onClick={generateRefundsReport}
                  disabled={generatingRefundReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingRefundReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </button>
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
                              disabled={processingRefund === refund._id}
                              className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                processingRefund === refund._id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {processingRefund === refund._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Processing...
                                </>
                              ) : (
                                "Mark as Processed"
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleProcessRefund(refund._id, "failed")
                              }
                              disabled={processingRefund === refund._id}
                              className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                processingRefund === refund._id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {processingRefund === refund._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Processing...
                                </>
                              ) : (
                                "Mark as Failed"
                              )}
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

      {/* Contact Messages Tab Content */}
      {activeTab === "contact-messages" && (
        <div className="space-y-6 ">
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-[88%] mx-auto -mt-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Contact Messages</h2>
              <div className="flex gap-4">
                {/* Sort Filter */}
                <select
                  value={contactStatusFilter}
                  onChange={(e) => setContactStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Messages</option>
                  <option value="recent">Recent First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="contactId">By Contact ID</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading contact messages...</p>
              </div>
            ) : contactMessages.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No contact messages found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages
                  .sort((a, b) => {
                    switch (contactStatusFilter) {
                      case "recent":
                        return new Date(b.createdAt) - new Date(a.createdAt);
                      case "oldest":
                        return new Date(a.createdAt) - new Date(b.createdAt);
                      case "contactId":
                        return a.contactId - b.contactId;
                      default:
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                  })
                  .map((message) => (
                    <div
                      key={message._id}
                      className="bg-slate-800 rounded-lg p-6 border border-slate-600 hover:border-blue-500 transition-colors shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {message.name || 'Unknown'}
                            </h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-900 text-indigo-200 border border-indigo-700">
                              Contact #{message.contactId || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {message.email || 'No email'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4 text-emerald-400" />
                              {message.phoneNumber || 'No phone'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'No date'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Message:</h4>
                        <p className="text-gray-200 whitespace-pre-wrap">{message.contactMessage || 'No message content'}</p>
                      </div>

                      <div className="flex justify-end">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`mailto:${message.email || ''}?subject=Re: Your Contact Message`, '_blank')}
                            disabled={!message.email}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                              message.email 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Mail className="h-4 w-4" />
                            Reply
                          </button>
                          <button
                            onClick={() => {
                              if (message.email) {
                                navigator.clipboard.writeText(message.email);
                                toast.success("Email copied to clipboard!");
                              } else {
                                toast.error("No email available");
                              }
                            }}
                            disabled={!message.email}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              message.email 
                                ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-md hover:shadow-lg' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Copy Email
                          </button>
                          <button
                            onClick={() => {
                              if (message.phoneNumber) {
                                navigator.clipboard.writeText(message.phoneNumber.toString());
                                toast.success("Phone number copied to clipboard!");
                              } else {
                                toast.error("No phone number available");
                              }
                            }}
                            disabled={!message.phoneNumber}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              message.phoneNumber 
                                ? 'bg-teal-800 hover:bg-teal-600 text-white shadow-md hover:shadow-lg' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Copy Phone
                          </button>
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
  );
};

export default UserManagement;
