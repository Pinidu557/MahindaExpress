import React from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Hero from "../components/Hero";
import { Services } from "../components/Services";
import { JourneySection } from "../components/TopJourney";
import BookingSteps from "../components/BookingSteps";
import Footer from "../components/Footer";

const PassengerHome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <PassengerNavbar />
      <Hero />
      <Services />
      <JourneySection />
      <BookingSteps />
      <Footer />
    </div>
  );
};

export default PassengerHome;
