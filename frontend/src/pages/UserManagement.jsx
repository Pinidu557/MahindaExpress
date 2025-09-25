import React, { useState, useEffect, useContext, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import {
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Building2,
  FileText,
  Search,
  Filter,
  Download,
  Clock,
  AlertCircle,
} from "lucide-react";

const UserManagement = () => {
  const { backendUrl } = useContext(AppContent);
  const [activeTab, setActiveTab] = useState("users");
  const [bankTransfers, setBankTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchBankTransfers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/bank-transfers`
      );
      if (data.success) {
        setBankTransfers(data.bankTransfers);
      }
    } catch (error) {
      console.error("Error fetching bank transfers:", error);
      toast.error("Failed to load bank transfers");
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "bank-transfers") {
      fetchBankTransfers();
    }
  }, [activeTab, fetchBankTransfers]);

  const handleApproveTransfer = async (bookingId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/approve-bank-transfer/${bookingId}`
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
      const { data } = await axios.put(
        `${backendUrl}/api/admin/reject-bank-transfer/${bookingId}`,
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
          <nav className="flex space-x-8 border-b border-gray-700">
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
          </nav>
        </div>

        {/* Users Tab Content */}
        {activeTab === "users" && (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User List</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-400">Loading users...</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>User management functionality coming soon...</p>
                <p className="text-sm mt-2">
                  This will include user details, booking history, and account
                  management.
                </p>
              </div>
            )}
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
                        <img
                          src={`${backendUrl}/${selectedReceipt.bankTransferDetails.receiptPath}`}
                          alt="Payment Receipt"
                          className="max-w-full h-auto rounded-lg border border-gray-600"
                        />
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
    </div>
  );
};

export default UserManagement;
