import React from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Header from "../components/Header";

const PassengerHome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <PassengerNavbar />
      {/* <Header /> */}
    </div>
  );
};

export default PassengerHome;
