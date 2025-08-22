import React from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Header from "../components/Header";

const PassengerHome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/bg_img.png ')] bg-cover bg-center">
      <PassengerNavbar />
      <Header />
    </div>
  );
};

export default PassengerHome;
