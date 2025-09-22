import React, { useEffect, useState, useContext } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { CircleCheckBig, Download, FileText } from "lucide-react";
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

  // Get booking ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("booking_id");

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
          <CircleCheckBig className="text-green-500 mb-4" size={55} />
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg mb-6 text-center">
            Thank you for your booking. Your payment has been processed
            successfully.
          </p>

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
                </div>
              </div>

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
            </>
          ) : (
            <p className="text-yellow-400">
              Booking details not available. Your ticket was still processed
              successfully.
            </p>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate("/journeys")}
            >
              Book Another Journey
            </Button>
            <Button className="cursor-pointer " onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
