import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Download,
  Calendar,
  Bus,
  MapPin,
  CreditCard,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        axios.defaults.withCredentials = true;
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/${bookingId}`
        );
        console.log("Booking details:", data);

        if (data.success) {
          setBooking(data.booking);
        } else {
          toast.error("Failed to load booking details");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast.error("Could not load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, backendUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadReceipt = () => {
    setIsGenerating(true);

    // Create an entirely new receipt element
    const receiptContainer = document.createElement("div");
    receiptContainer.style.position = "fixed";
    receiptContainer.style.left = "-9999px";
    receiptContainer.style.top = "-9999px";
    receiptContainer.style.backgroundColor = "white";
    receiptContainer.style.width = "750px";
    receiptContainer.style.padding = "32px";
    document.body.appendChild(receiptContainer);

    // Create receipt content with direct styling
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
              <td style="padding:8px 16px;">${booking._id}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Date:</td>
              <td style="padding:8px 16px;">${formatDate(new Date())}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Customer Name:</td>
              <td style="padding:8px 16px;">${booking.passengerName || ""}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Email:</td>
              <td style="padding:8px 16px;">${booking.email || ""}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Phone Number:</td>
              <td style="padding:8px 16px;">${booking.mobileNumber || ""}</td>
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
              <td style="padding:8px 16px;">${booking.boardingPoint || ""} to ${
      booking.dropoffPoint || ""
    }</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Journey Date:</td>
              <td style="padding:8px 16px;">${formatDate(
                booking.journeyDate
              )}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Departure Time:</td>
              <td style="padding:8px 16px;">${
                booking.departureTime || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Bus Type:</td>
              <td style="padding:8px 16px;">${
                booking.busType || "Express Bus"
              }</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:8px 16px; font-weight:600;">Seats:</td>
              <td style="padding:8px 16px;">${
                booking.seats?.join(", ") || "N/A"
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
                booking.totalFare || "0"
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

    // Generate PDF
    setTimeout(() => {
      try {
        html2canvas(receiptContainer, {
          scale: 2,
          backgroundColor: "white",
          allowTaint: true,
          useCORS: true,
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
              pdf.save(`MahindaExpress_Ticket_${booking._id}.pdf`);

              toast.success("Receipt downloaded successfully!");
            } catch (err) {
              console.error("PDF generation error:", err);
              toast.error("Failed to generate PDF");
            }

            // Clean up
            document.body.removeChild(receiptContainer);
            setIsGenerating(false);
          })
          .catch((err) => {
            console.error("Canvas generation error:", err);
            document.body.removeChild(receiptContainer);
            toast.error("Failed to generate receipt");
            setIsGenerating(false);
          });
      } catch (err) {
        console.error("Error in html2canvas process:", err);
        document.body.removeChild(receiptContainer);
        toast.error("Failed to generate receipt");
        setIsGenerating(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PassengerNavbar />

      <div className="container mx-auto px-4 pt-24 pb-12 w-[90%]">
        <button
          onClick={() => navigate("/passengerDashboard")}
          className="flex items-center text-indigo-400 hover:text-indigo-300 mb-6 cursor-pointer"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-6 pb-4 border-b border-slate-700">
            Booking Details
          </h1>

          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          ) : booking ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-700 p-5 rounded-lg">
                  <div className="flex items-center gap-3 mb-4 text-indigo-400 border-b border-slate-600 pb-3">
                    <Calendar size={20} />
                    <h2 className="text-lg font-medium">Journey Information</h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Journey Date:</span>
                      <span>{formatDate(booking.journeyDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Boarding Point:</span>
                      <span>{booking.boardingPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Drop-off Point:</span>
                      <span>{booking.dropoffPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Departure Time:</span>
                      <span>{booking.departureTime || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Arrival Time:</span>
                      <span>{booking.arrivalTime || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-5 rounded-lg">
                  <div className="flex items-center gap-3 mb-4 text-indigo-400 border-b border-slate-600 pb-3">
                    <Bus size={20} />
                    <h2 className="text-lg font-medium">Booking Information</h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Booking ID:</span>
                      <span>{booking._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Booking Date:</span>
                      <span>{formatDate(booking.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Customer Name:</span>
                      <span>{booking.passengerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span>{booking.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone Number:</span>
                      <span>{booking.mobileNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bus Type:</span>
                      <span>{booking.busType || "Express Bus"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seats:</span>
                      <span>{booking.seats?.join(", ") || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === "paid"
                            ? "bg-green-900 text-green-300"
                            : booking.status === "confirmed"
                            ? "bg-blue-900 text-blue-300"
                            : booking.status === "cancelled"
                            ? "bg-red-900 text-red-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {booking.status?.charAt(0).toUpperCase() +
                          booking.status?.slice(1) || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 p-5 rounded-lg mb-6">
                <div className="flex items-center gap-3 mb-4 text-indigo-400 border-b border-slate-600 pb-3">
                  <CreditCard size={20} />
                  <h2 className="text-lg font-medium">Payment Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block">Fare:</span>
                    <span className="font-medium">LKR {booking.totalFare}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">
                      Payment Method:
                    </span>
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">
                      Payment Status:
                    </span>
                    <span className="font-medium text-green-400">Paid</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payment Date:</span>
                    <span className="font-medium">
                      {formatDate(booking.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={downloadReceipt}
                  disabled={isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Download E-Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-slate-700 p-8 rounded-lg text-center">
              <p className="text-slate-300 mb-4">
                Booking not found or you don't have permission to view it.
              </p>
              <button
                onClick={() => navigate("/passengerDashboard")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetails;
