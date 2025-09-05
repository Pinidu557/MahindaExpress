import React, { useEffect, useState } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Hero from "../components/Hero";
import { Services } from "../components/Services";
import { JourneySection } from "../components/TopJourney";
import BookingSteps from "../components/BookingSteps";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

const PassengerHome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      {loading ? (
        <Loader />
      ) : (
        <>
          <PassengerNavbar />
          <Hero />
          <Services />
          <JourneySection />
          <BookingSteps />
          <Footer />
        </>
      )}
    </div>
  );
};

export default PassengerHome;
