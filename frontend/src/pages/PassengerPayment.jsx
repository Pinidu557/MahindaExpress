import React, { useEffect, useState, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { toast } from "react-toastify";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ArrowLeft, MapPin, Calendar, Users } from "lucide-react";

// Replace with your Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51S7pbeH2L7zJmMhaG2fcAE2ZPGybRNDg9h9apuKsP0wp3O5P3xekY7fVtoE0nL2RopZjowUxtEdYkVmps3qmIfvj00UNRsKkOc"
);

const CheckoutForm = ({ bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { backendUrl } = useContext(AppContent);

  // Get bookingId and routeData from navigation state
  const routeData = location.state || {};
  const bookingId = routeData.bookingId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url:
          window.location.origin + "/journeys/checkout/payment/payment-success",
      },
      redirect: "if_required",
    });

    setIsProcessing(false);

    if (result.error) {
      toast.error(result.error.message);
    } else if (
      result.paymentIntent &&
      result.paymentIntent.status === "succeeded"
    ) {
      // Update booking status to paid
      try {
        await axios.put(`${backendUrl}/api/bookings/${bookingId}`, {
          status: "paid",
        });
      } catch (error) {
        console.error("Error updating booking status:", error);
      }

      toast.success("Payment successful!");
      setTimeout(() => {
        navigate("/journeys/checkout/payment/payment-success");
      }, 1500);
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

  // Back to booking details handler with all necessary fields preserved
  const handleBackToCheckout = () => {
    // Calculate fare per seat if needed
    const farePerSeat =
      bookingDetails.totalFare && bookingDetails.seats?.length
        ? Math.round(bookingDetails.totalFare / bookingDetails.seats.length)
        : routeData.fare || 895;

    // Determine departure and arrival time based on route
    let departureTime = bookingDetails.departureTime || routeData.departureTime;
    let arrivalTime = bookingDetails.arrivalTime || routeData.arrivalTime; // Declare arrivalTime properly

    if (
      bookingDetails.boardingPoint === "Colombo" &&
      bookingDetails.dropoffPoint === "Anuradhapura"
    ) {
      departureTime = "07:00 AM";
      arrivalTime = "01:25 PM";
    }
    if (
      bookingDetails.boardingPoint === "Colombo" &&
      bookingDetails.dropoffPoint === "Ampara"
    ) {
      departureTime = "10:45 AM";
      arrivalTime = "03:15 PM";
    }

    // Preserve original route data and enhance with booking details
    navigate("/journeys/checkout", {
      state: {
        ...routeData, // Keep all original route data
        bookingId: bookingId,
        startLocation: bookingDetails.boardingPoint || routeData.startLocation,
        endLocation: bookingDetails.dropoffPoint || routeData.endLocation,
        journeyDate: bookingDetails.journeyDate || routeData.journeyDate,
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        routeId: bookingDetails.routeId || routeData.routeId,
        fare: farePerSeat,
        busType: bookingDetails.busType || routeData.busType || "Express Bus",
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 bg-slate-800 p-8 rounded-xl shadow-lg w-[450px] mx-auto mt-40 mb-10"
      >
        <h2 className="text-xl font-bold mb-2 text-center text-indigo-400">
          Payment Details
        </h2>

        {/* Payment Summary Section */}
        <div className="bg-slate-700 p-4 rounded-lg mb-2">
          <h3 className="text-md font-semibold text-indigo-300 mb-3 border-b border-slate-600 pb-2">
            Journey Summary
          </h3>

          <div className="flex items-start mb-3">
            <MapPin
              className="text-gray-400 mr-2 mt-1 flex-shrink-0"
              size={18}
            />
            <div>
              <p className="text-gray-300 text-sm">Route</p>
              <p className="font-medium text-white">
                {bookingDetails.boardingPoint || "Loading..."} to{" "}
                {bookingDetails.dropoffPoint || ""}
              </p>
            </div>
          </div>

          <div className="flex items-start mb-3">
            <Calendar
              className="text-gray-400 mr-2 mt-1 flex-shrink-0"
              size={18}
            />
            <div>
              <p className="text-gray-300 text-sm">Travel Date</p>
              <p className="font-medium text-white">
                {formatDate(bookingDetails.journeyDate) || "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex items-start mb-3">
            <Users
              className="text-gray-400 mr-2 mt-1 flex-shrink-0"
              size={18}
            />
            <div>
              <p className="text-gray-300 text-sm">Seats</p>
              <p className="font-medium text-white">
                {bookingDetails.seats
                  ? bookingDetails.seats.join(", ")
                  : "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-600">
            <span className="text-gray-300">Total Amount:</span>
            <span className="text-xl font-bold text-indigo-300">
              LKR {bookingDetails.totalFare || 0}
            </span>
          </div>
        </div>

        <PaymentElement
          options={{
            layout: { type: "tabs" },
            fields: {
              billingDetails: "auto",
            },
          }}
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-indigo-700 py-3 rounded-lg font-semibold mt-3 cursor-pointer text-white flex items-center justify-center"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Processing...
            </>
          ) : (
            `Pay Now - LKR ${bookingDetails.totalFare || 0}`
          )}
        </button>

        <button
          type="button"
          onClick={handleBackToCheckout}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold mt-2 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Edit Details
        </button>
      </form>
    </div>
  );
};

const PassengerPayment = () => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const routeData = location.state || {};
  const bookingId = routeData.bookingId;
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState({});
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  // Fetch booking details when page loads
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (bookingId) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/bookings/${bookingId}`
          );
          if (data.success) {
            setBookingDetails(data.booking);
          }
        } catch (error) {
          console.error("Error fetching booking details:", error);
        }
      }
    };

    fetchBookingDetails();
  }, [bookingId, backendUrl]);

  // Create payment intent only once after booking details are loaded
  useEffect(() => {
    async function fetchClientSecret() {
      if (!bookingId || paymentInitialized) return;

      setIsLoading(true);
      try {
        // Get the amount from booking details
        const amountToCharge = bookingDetails.totalFare
          ? parseInt(bookingDetails.totalFare, 10)
          : 8000; // Default to 8000 if totalFare is not available

        console.log("Creating payment intent for amount:", amountToCharge);

        const { data } = await axios.post(
          backendUrl + "/api/payments/create-payment-intent",
          {
            amount: amountToCharge,
            bookingId,
          }
        );
        setClientSecret(data.clientSecret);
        setPaymentInitialized(true); // Mark as initialized to prevent recreating
      } catch (error) {
        toast.error("Payment setup failed");
        console.error("Payment intent creation error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Only create payment intent if we have booking details and haven't done it yet
    if (Object.keys(bookingDetails).length > 0 && !paymentInitialized) {
      fetchClientSecret();
    }
  }, [bookingId, backendUrl, bookingDetails, paymentInitialized]);

  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorBackground: "#1e293b",
            colorPrimary: "#6366f1",
            colorText: "#fff",
          },
        },
      }
    : {};

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PassengerNavbar />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="bg-slate-800 p-10 rounded-xl shadow-lg flex flex-col items-center">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={50} />
            <h2 className="text-xl font-semibold text-white">
              Setting up secure payment...
            </h2>
            <p className="text-gray-400 mt-2 text-center">
              Please wait while we connect to our payment provider
            </p>
          </div>
        </div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm bookingDetails={bookingDetails} />
        </Elements>
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="bg-slate-800 p-10 rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-semibold text-red-400">
              Unable to initialize payment
            </h2>
            <p className="text-gray-400 mt-2 mb-4">
              There was a problem connecting to our payment service.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PassengerPayment;
