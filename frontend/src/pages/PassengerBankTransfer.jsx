import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Upload,
  FileText,
  Building2,
  Loader2,
  CheckCircle,
  Copy,
} from "lucide-react";

const PassengerBankTransfer = () => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, bookingDetails, routeData } = location.state || {};

  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionReference, setTransactionReference] = useState("");
  const [payerName, setPayerName] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Bank details
  const bankDetails = {
    bankName: "Commercial Bank of Ceylon",
    accountName: "Mahinda Express (Pvt) Ltd",
    accountNumber: "8001234567890",
    branch: "Colombo Main Branch",
    swiftCode: "CCEYLKLX",
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload JPG, PNG or PDF files only");
        return;
      }

      setPaymentReceipt(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setReceiptPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  // Copy bank details to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentReceipt) {
      toast.error("Please upload payment receipt");
      return;
    }

    if (!transactionReference.trim()) {
      toast.error("Please enter transaction reference");
      return;
    }

    if (!payerName.trim()) {
      toast.error("Please enter payer name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("receipt", paymentReceipt);
      formData.append("bookingId", bookingId);
      formData.append("transactionReference", transactionReference);
      formData.append("payerName", payerName);
      formData.append("paymentDate", paymentDate);
      formData.append("totalAmount", bookingDetails.totalFare);

      // Upload receipt and update booking
      const response = await axios.post(
        `${backendUrl}/api/payments/bank-transfer`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Payment receipt uploaded successfully!");
        setTimeout(() => {
          navigate(
            `/journeys/checkout/payment/payment-success?booking_id=${bookingId}&payment_method=bank_transfer`
          );
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to upload receipt");
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload payment receipt"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Go back to payment options
  const handleBackToPayment = () => {
    navigate("/journeys/checkout/payment", {
      state: { bookingId, routeData },
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PassengerNavbar />

      <div className="min-h-screen flex flex-col items-center justify-center py-8 mt-20">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400 flex items-center justify-center">
              <Building2 className="mr-3" size={28} />
              Bank Transfer Payment
            </h2>

            <div className="grid md:grid-cols-1 gap-8">
              {/* Left Column - Bank Details & Booking Summary */}
              <div className="space-y-6">
                {/* Booking Summary */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-indigo-300 mb-3 border-b border-slate-600 pb-2">
                    Journey Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin
                        className="text-gray-400 mr-2 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-gray-300 text-sm">Route</p>
                        <p className="font-medium text-white">
                          {bookingDetails?.boardingPoint} to{" "}
                          {bookingDetails?.dropoffPoint}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar
                        className="text-gray-400 mr-2 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-gray-300 text-sm">Travel Date</p>
                        <p className="font-medium text-white">
                          {formatDate(bookingDetails?.journeyDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users
                        className="text-gray-400 mr-2 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-gray-300 text-sm">Seats</p>
                        <p className="font-medium text-white">
                          {bookingDetails?.seats?.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-600">
                      <span className="text-gray-300">Total Amount:</span>
                      <span className="text-xl font-bold text-indigo-300">
                        LKR {bookingDetails?.totalFare}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-indigo-300 mb-4 border-b border-slate-600 pb-2">
                    Bank Account Details
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Bank Name:</span>
                      <div className="flex items-center">
                        <span className="font-medium">
                          {bankDetails.bankName}
                        </span>
                        <button
                          onClick={() => copyToClipboard(bankDetails.bankName)}
                          className="ml-2 p-1 hover:bg-slate-600 rounded"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Account Name:</span>
                      <div className="flex items-center">
                        <span className="font-medium">
                          {bankDetails.accountName}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(bankDetails.accountName)
                          }
                          className="ml-2 p-1 hover:bg-slate-600 rounded"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Account Number:</span>
                      <div className="flex items-center">
                        <span className="font-medium font-mono">
                          {bankDetails.accountNumber}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(bankDetails.accountNumber)
                          }
                          className="ml-2 p-1 hover:bg-slate-600 rounded"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Branch:</span>
                      <span className="font-medium">{bankDetails.branch}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">SWIFT Code:</span>
                      <div className="flex items-center">
                        <span className="font-medium font-mono">
                          {bankDetails.swiftCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(bankDetails.swiftCode)}
                          className="ml-2 p-1 hover:bg-slate-600 rounded"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-blue-300 text-xs">
                      <strong>Important:</strong> Please transfer exactly LKR{" "}
                      {bookingDetails?.totalFare}
                      and use booking ID "{bookingId}" as the transfer
                      reference.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Upload Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-indigo-300 mb-4 border-b border-slate-600 pb-2">
                      Upload Payment Receipt
                    </h3>

                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payment Receipt *
                      </label>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label
                          htmlFor="receipt-upload"
                          className="cursor-pointer"
                        >
                          {paymentReceipt ? (
                            <div className="space-y-2">
                              <CheckCircle
                                className="mx-auto text-green-400"
                                size={32}
                              />
                              <p className="text-green-400 font-medium">
                                {paymentReceipt.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Click to change file
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload
                                className="mx-auto text-gray-400"
                                size={32}
                              />
                              <p className="text-gray-300">
                                Click to upload receipt
                              </p>
                              <p className="text-gray-400 text-sm">
                                JPG, PNG or PDF (Max 5MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>

                      {/* Image Preview */}
                      {receiptPreview && (
                        <div className="mt-4">
                          <img
                            src={receiptPreview}
                            alt="Receipt preview"
                            className="max-w-full h-40 object-contain mx-auto rounded border"
                          />
                        </div>
                      )}
                    </div>

                    {/* Transaction Reference */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Transaction Reference *
                      </label>
                      <input
                        type="text"
                        value={transactionReference}
                        onChange={(e) =>
                          setTransactionReference(e.target.value)
                        }
                        placeholder="Enter transaction/reference number"
                        className="w-full px-3 py-2 rounded-lg bg-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    {/* Payer Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payer Name *
                      </label>
                      <input
                        type="text"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="Name of person who made the payment"
                        className="w-full px-3 py-2 rounded-lg bg-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    {/* Payment Date */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 rounded-lg bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !paymentReceipt}
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 py-3 rounded-lg font-semibold text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2" size={20} />
                          Submit Payment Receipt
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBackToPayment}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold mt-4 flex items-center justify-center cursor-pointer"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back to Payment Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PassengerBankTransfer;
