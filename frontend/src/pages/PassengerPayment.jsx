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
import { Loader2, ArrowLeft } from "lucide-react";

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

  // Back to booking details handler
  const handleBackToCheckout = () => {
    // Pass ALL original route data plus booking ID
    navigate("/journeys/checkout", {
      state: {
        ...routeData, // Keep all original route data
        bookingId,
        // Override with any data from booking details if available
        ...(bookingDetails &&
          bookingDetails.boardingPoint && {
            startLocation: bookingDetails.boardingPoint,
          }),
        ...(bookingDetails &&
          bookingDetails.dropoffPoint && {
            endLocation: bookingDetails.dropoffPoint,
          }),
        ...(bookingDetails &&
          bookingDetails.journeyDate && {
            journeyDate: bookingDetails.journeyDate,
          }),
        ...(bookingDetails &&
          bookingDetails.routeId && {
            routeId: bookingDetails.routeId,
          }),
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 bg-slate-800 p-8 rounded-xl shadow-lg w-[400px] mx-auto mt-40 mb-10"
      >
        <h2 className="text-xl font-bold mb-2 text-center text-indigo-400">
          Payment Details
        </h2>

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
            "Pay Now"
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

const PassengerPayment = ({ amount = 895 }) => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const routeData = location.state || {};
  const bookingId = routeData.bookingId;
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState({});

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

  useEffect(() => {
    async function fetchClientSecret() {
      setIsLoading(true);
      try {
        const { data } = await axios.post(
          backendUrl + "/api/payments/create-payment-intent",
          {
            amount: bookingDetails.totalFare || amount,
            bookingId,
          }
        );
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error("Payment setup failed");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClientSecret();
  }, [amount, bookingId, backendUrl, bookingDetails.totalFare]);

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorBackground: "#1e293b",
        colorPrimary: "#6366f1",
        colorText: "#fff",
      },
    },
  };

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
