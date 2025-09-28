import React, { useEffect, useState, useContext } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import {
  CircleCheckBig,
  Download,
  FileText,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import Button from "../components/ui/Button";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { backendUrl, user } = useContext(AppContent);
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundDetails, setRefundDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    reason: "",
  });
  const [isCancelling, setIsCancelling] = useState(false);

  // Get booking ID and payment method from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("booking_id");
  const paymentMethod = urlParams.get("payment_method");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/${bookingId}`
        );
        if (data.success) {
          setBookingData(data.booking);
          console.log("Booking data:", data.booking);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Could not load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, backendUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if booking can be cancelled (within 1 hour)
  const canCancelBooking = () => {
    if (!bookingData || !bookingData.createdAt) return false;
    const bookingTime = new Date(bookingData.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - bookingTime;
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    return timeDifference < oneHour;
  };

  // Handle cancel booking
  const handleCancelBooking = () => {
    if (!canCancelBooking()) {
      toast.error("Booking can only be cancelled within 1 hour of booking");
      return;
    }
    setShowCancelModal(true);
  };

  // Handle refund form submission
  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    setIsCancelling(true);

    try {
      console.log("Cancelling booking:", bookingId);
      console.log("Refund details:", refundDetails);

      const response = await axios.post(
        `${backendUrl}/api/bookings/${bookingId}/cancel`,
        {
          refundDetails,
          reason: refundDetails.reason,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          "Booking cancelled successfully. Refund will be processed within 3-5 business days."
        );
        setShowCancelModal(false);
        setShowRefundForm(false);

        // Refresh booking data
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/${bookingId}`
        );
        if (data.success) {
          setBookingData(data.booking);
        }
      } else {
        toast.error(response.data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle refund details change
  const handleRefundChange = (e) => {
    setRefundDetails({
      ...refundDetails,
      [e.target.name]: e.target.value,
    });
  };

  // Fallback text-based receipt download
  const downloadTextReceipt = () => {
    try {
      const text = `
MAHINDA EXPRESS BUS TICKET RECEIPT

Receipt Number: ${bookingData._id}
Date: ${formatDate(new Date())}
Customer: ${user?.firstname} ${user?.lastname}
Email: ${user?.email}

JOURNEY DETAILS
Route: ${bookingData.boardingPoint} to ${bookingData.dropoffPoint}
Date: ${formatDate(bookingData.journeyDate)}
Departure Time: ${bookingData.departureTime || "N/A"}
Bus Type: ${bookingData.busType || "Express Bus"}
Seats: ${bookingData.seats?.join(", ") || "N/A"}

Total Amount: LKR ${bookingData.totalFare}

THANK YOU FOR TRAVELING WITH MAHINDA EXPRESS!
Please present this ticket when boarding the bus
`;

      const element = document.createElement("a");
      const file = new Blob([text], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `MahindaExpress_Ticket_${
        bookingData?._id || "receipt"
      }.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("E-Receipt downloaded as text file");
      setIsGenerating(false);
    } catch (e) {
      console.error("Text download failed:", e);
      toast.error("Failed to download receipt");
      setIsGenerating(false);
    }
  };

  // Replace your downloadReceipt function with this simpler, more reliable version:
  const downloadReceipt = () => {
    setIsGenerating(true);

    if (
      bookingData.boardingPoint == "Colombo" &&
      bookingData.dropoffPoint == "Ampara"
    ) {
      bookingData.departureTime = "12.00 PM";
    }

    // Create an entirely new receipt element (don't use hidden one)
    const receiptContainer = document.createElement("div");
    receiptContainer.style.position = "fixed";
    receiptContainer.style.left = "-9999px";
    receiptContainer.style.top = "-9999px";
    receiptContainer.style.backgroundColor = "white";
    receiptContainer.style.width = "750px";
    receiptContainer.style.padding = "32px";
    document.body.appendChild(receiptContainer);

    // Create receipt content with direct styling (no Tailwind)
    receiptContainer.innerHTML = `
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="font-size:24px; font-weight:bold; color:#1e40af; margin-bottom:4px;">MAHINDA EXPRESS</h1>
      <h2 style="font-size:20px; font-weight:bold; margin-bottom:16px;">BUS TICKET RECEIPT</h2>
    </div>
    
    <div style="border:2px solid #e5e7eb; border-radius:6px; padding:16px; margin-bottom:24px;">
      <table style="width:100%; border-collapse:collapse;">
        <tbody>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Receipt Number:</td>
            <td style="padding:8px 16px;">${bookingData._id}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Date:</td>
            <td style="padding:8px 16px;">${formatDate(new Date())}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Customer Name:</td>
            <td style="padding:8px 16px;">${bookingData.passengerName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Email:</td>
            <td style="padding:8px 16px;">${bookingData.email}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div style="border:2px solid #e5e7eb; border-radius:6px; padding:16px; margin-bottom:24px;">
      <h3 style="font-weight:bold; font-size:18px; margin-bottom:12px;">Journey Details</h3>
      <table style="width:100%; border-collapse:collapse;">
        <tbody>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Route:</td>
            <td style="padding:8px 16px;">${
              bookingData.boardingPoint || ""
            } to ${bookingData.dropoffPoint || ""}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Journey Date:</td>
            <td style="padding:8px 16px;">${formatDate(
              bookingData.journeyDate
            )}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Departure Time:</td>
            <td style="padding:8px 16px;">${
              bookingData.departureTime || "N/A"
            }</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Bus Type:</td>
            <td style="padding:8px 16px;">${
              bookingData.busType || "Express Bus"
            }</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 16px; font-weight:600;">Seats:</td>
            <td style="padding:8px 16px;">${
              bookingData.seats?.join(", ") || "N/A"
            }</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div style="border:2px solid #e5e7eb; border-radius:6px; padding:16px;">
      <table style="width:100%;">
        <tbody>
          <tr>
            <td style="padding:8px 16px; font-weight:bold; text-align:right;">Total Amount:</td>
            <td style="padding:8px 16px; font-weight:bold;">LKR ${
              bookingData.totalFare || "0"
            }</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div style="text-align:center; margin-top:32px;">
      <p style="font-weight:600;">THANK YOU FOR TRAVELING WITH MAHINDA EXPRESS!</p>
      <p style="font-size:14px; margin-top:8px;">Please present this ticket when boarding the bus</p>
    </div>
  `;

    // Wait for rendering
    setTimeout(() => {
      try {
        html2canvas(receiptContainer, {
          scale: 2,
          backgroundColor: "white",
          allowTaint: true,
          useCORS: true,
          logging: true,
        })
          .then((canvas) => {
            try {
              // Convert to PDF
              const imgData = canvas.toDataURL("image/png");
              const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
              });

              const imgProps = pdf.getImageProperties(imgData);
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

              pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
              pdf.save(
                `MahindaExpress_Ticket_${bookingData?._id || "receipt"}.pdf`
              );

              toast.success("Receipt downloaded successfully!");
            } catch (err) {
              console.error("PDF generation error:", err);
              downloadTextReceipt(); // Fallback
            }

            // Clean up
            document.body.removeChild(receiptContainer);
            setIsGenerating(false);
          })
          .catch((err) => {
            console.error("Canvas generation error:", err);
            document.body.removeChild(receiptContainer);
            downloadTextReceipt(); // Fallback
            setIsGenerating(false);
          });
      } catch (err) {
        console.error("Error in html2canvas process:", err);
        document.body.removeChild(receiptContainer);
        downloadTextReceipt(); // Fallback
        setIsGenerating(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white ">
      <PassengerNavbar />

      <div className="container mx-auto py-10 px-4 mt-20">
        <div className="bg-slate-800 p-8 rounded-xl shadow-lg my-10 flex flex-col items-center max-w-3xl mx-auto">
          {bookingData && bookingData.status === "cancelled" ? (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <X size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Booking Cancelled
              </h1>
              <p className="text-lg mb-6 text-center text-slate-300">
                Your booking has been successfully cancelled. Refund will be
                processed within 3-5 business days to your bank account.
              </p>
            </>
          ) : (
            <>
              <CircleCheckBig className="text-green-500 mb-4" size={55} />
              <h1 className="text-3xl font-bold text-white mb-4">
                {paymentMethod === "bank_transfer"
                  ? "Payment Receipt Uploaded!"
                  : "Payment Successful!"}
              </h1>
              <p className="text-lg mb-6 text-center">
                {paymentMethod === "bank_transfer"
                  ? "Thank you for uploading your payment receipt. We will verify your payment within 24 hours and send you a confirmation email."
                  : "Thank you for your booking. Your payment has been processed successfully."}
              </p>
            </>
          )}

          {isLoading ? (
            <p>Loading booking details...</p>
          ) : bookingData ? (
            <>
              {/* Hidden receipt template for PDF generation */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                  visibility: "hidden",
                }}
              >
                <div
                  id="receipt"
                  className="bg-white text-black p-8"
                  style={{ width: "750px", display: "none" }}
                >
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-800">
                      MAHINDA EXPRESS
                    </h1>
                    <h2 className="text-xl font-bold">BUS TICKET RECEIPT</h2>
                  </div>

                  <div className="border-2 border-gray-200 rounded-md p-4 mb-6">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">
                            Receipt Number:
                          </td>
                          <td className="py-2 px-4">{bookingData._id}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">Date:</td>
                          <td className="py-2 px-4">
                            {formatDate(new Date())}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">
                            Customer Name:
                          </td>
                          <td className="py-2 px-4">
                            {user?.firstname} {user?.lastname}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">Email:</td>
                          <td className="py-2 px-4">{user?.email}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border-2 border-gray-200 rounded-md p-4 mb-6">
                    <h3 className="font-bold text-lg mb-3">Journey Details</h3>
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">Route:</td>
                          <td className="py-2 px-4">
                            {bookingData.boardingPoint} to{" "}
                            {bookingData.dropoffPoint}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">
                            Journey Date:
                          </td>
                          <td className="py-2 px-4">
                            {formatDate(bookingData.journeyDate)}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">
                            Departure Time:
                          </td>
                          <td className="py-2 px-4">
                            {bookingData.departureTime}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">Bus Type:</td>
                          <td className="py-2 px-4">
                            {bookingData.busType || "Express Bus"}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-4 font-semibold">Seats:</td>
                          <td className="py-2 px-4">
                            {bookingData.seats?.join(", ") || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border-2 border-gray-200 rounded-md p-4">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2 px-4 font-bold text-right">
                            Total Amount:
                          </td>
                          <td className="py-2 px-4 font-bold">
                            LKR {bookingData.totalFare}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center mt-8">
                    <p className="font-semibold">
                      THANK YOU FOR TRAVELING WITH MAHINDA EXPRESS!
                    </p>
                    <p className="text-sm mt-2">
                      Please present this ticket when boarding the bus
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-4 p-4 bg-slate-700 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">
                  Booking Summary
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-400">Booking ID:</span>{" "}
                    {bookingData._id}
                  </p>
                  <p>
                    <span className="text-gray-400">Route:</span>{" "}
                    {bookingData.boardingPoint} to {bookingData.dropoffPoint}
                  </p>
                  <p>
                    <span className="text-gray-400">Date:</span>{" "}
                    {formatDate(bookingData.journeyDate)}
                  </p>
                  <p>
                    <span className="text-gray-400">Seats:</span>{" "}
                    {bookingData.seats?.join(", ") || "N/A"}
                  </p>
                  <p>
                    <span className="text-gray-400">Amount:</span> LKR{" "}
                    {bookingData.totalFare}
                  </p>
                  {paymentMethod === "bank_transfer" && (
                    <p>
                      <span className="text-gray-400">Payment Status:</span>{" "}
                      {bookingData.status === "cancelled" ? (
                        <span className="text-red-400 font-medium">
                          Cancelled - Refund Pending
                        </span>
                      ) : (
                        <span className="text-yellow-400">
                          Pending Verification
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {bookingData.status === "paid" ? (
                <button
                  onClick={downloadReceipt}
                  className="flex items-center justify-center gap-2 bg-green-600 cursor-pointer  text-white py-3 px-6 rounded-lg font-semibold my-4 transition-all"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating Receipt...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download E-Receipt
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 w-full max-w-md my-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    {bookingData.status === "cancelled" ? (
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <X size={16} className="text-red-200" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-200 text-sm">!</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p
                        className={`font-medium ${
                          bookingData.status === "cancelled"
                            ? "text-red-500"
                            : "text-yellow-300"
                        }`}
                      >
                        {bookingData.status === "cancelled"
                          ? "E-Receipt Not Available - Booking Cancelled"
                          : "E-Receipt Not Available"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {bookingData.status === "cancelled"
                          ? "E-receipt is not available because this booking has been cancelled. Refund will be processed to your bank account."
                          : `E-receipt will be available when your payment is approved, please check booking history. ${
                              bookingData.status === "pending" &&
                              " Please complete your payment first."
                            }${
                              bookingData.status === "rejected" &&
                              " This booking has been rejected."
                            }`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-yellow-400">
              Booking details not available. Your ticket was still processed
              successfully.
            </p>
          )}

          <div className="flex gap-4 mt-6 justify-center items-center">
            <Button
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate("/journeys")}
            >
              Book Another Journey
            </Button>

            <Button className="cursor-pointer " onClick={() => navigate("/")}>
              Go to Home
            </Button>

            {bookingData &&
              canCancelBooking() &&
              bookingData.status !== "cancelled" && (
                <Button
                  className="cursor-pointer bg-red-800 hover:bg-red-700 text-red-500 hover:text-white font-medium px-6 py-1 rounded-lg transition-all duration-200 border-2 border-red-900 hover:border-red-600"
                  onClick={handleCancelBooking}
                >
                  Cancel Booking
                </Button>
              )}
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Cancel Booking
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 text-yellow-400">
                <Clock size={20} />
                <span className="font-medium">Cancellation Policy</span>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                You can cancel your booking within 1 hour of booking. A refund
                will be processed to your bank account.
              </p>

              <div className="bg-slate-700 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Booking Details</h4>
                <p className="text-slate-300 text-sm">
                  Route: {bookingData?.boardingPoint} to{" "}
                  {bookingData?.dropoffPoint}
                </p>
                <p className="text-slate-300 text-sm">
                  Date: {formatDate(bookingData?.journeyDate)}
                </p>
                <p className="text-slate-300 text-sm">
                  Amount: LKR {bookingData?.totalFare}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="cursor-pointer bg-red-600 hover:bg-red-700"
                onClick={() => setShowRefundForm(true)}
              >
                Proceed with Cancellation
              </Button>
              <Button
                className="cursor-pointer bg-gray-600 hover:bg-gray-700"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Details Form Modal */}
      {showRefundForm && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Refund Details
              </h3>
              <button
                onClick={() => setShowRefundForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={refundDetails.bankName}
                  onChange={handleRefundChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., Commercial Bank, People's Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={refundDetails.accountNumber}
                  onChange={handleRefundChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter your account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={refundDetails.accountHolderName}
                  onChange={handleRefundChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter account holder name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  name="reason"
                  value={refundDetails.reason}
                  onChange={handleRefundChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Please provide a reason for cancellation"
                />
              </div>

              <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-300 mb-2">
                  <AlertCircle size={16} />
                  <span className="font-medium">Important</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  Refund will be processed within 3-5 business days. Please
                  ensure your bank details are correct.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isCancelling}
                  className="cursor-pointer bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isCancelling ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Cancelling...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </Button>
                <Button
                  type="button"
                  className="cursor-pointer bg-gray-600 hover:bg-gray-700"
                  onClick={() => setShowRefundForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
