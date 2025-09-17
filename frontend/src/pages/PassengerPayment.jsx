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
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Replace with your Stripe publishable key
const stripePromise = loadStripe(
  "pk_test_51S7pbeH2L7zJmMhaG2fcAE2ZPGybRNDg9h9apuKsP0wp3O5P3xekY7fVtoE0nL2RopZjowUxtEdYkVmps3qmIfvj00UNRsKkOc"
);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Show processing state
    setIsProcessing(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure both URLs match exactly
        return_url:
          window.location.origin + "/journeys/checkout/payment/payment-success",
      },
      redirect: "if_required",
    });

    setIsProcessing(false);

    if (result.error) {
      // Show error to your customer
      toast.error(result.error.message);
    } else if (
      result.paymentIntent &&
      result.paymentIntent.status === "succeeded"
    ) {
      // Payment succeeded without redirect (less common)
      toast.success("Payment successful! Redirecting...");

      // Redirect to success page after a brief delay
      setTimeout(() => {
        navigate("/journeys/checkout/payment/payment-success");
      }, 1500); // 1.5 second delay to show the success message
    }
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
              billingDetails: "auto", // Let Stripe collect billing details automatically
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
      </form>
    </div>
  );
};

const PassengerPayment = ({ amount = 895, bookingId = "" }) => {
  const { backendUrl } = useContext(AppContent);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClientSecret() {
      setIsLoading(true);
      try {
        const { data } = await axios.post(
          backendUrl + "/api/payments/create-payment-intent",
          {
            amount,
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
  }, [amount, bookingId, backendUrl]);

  // Simplified options - removing problematic configuration
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
          <CheckoutForm />
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
