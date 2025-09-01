import React from "react";
import { assets } from "../assets/assets";
import Search from "./Search";

const Hero = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center mt-32">
      <h4 className="text-lg text-gray-50 font-medium text-center mb-3">
        Get your bus tickets
      </h4>
      <h2 className="text-5xl text-gray-50 font-bold capitalize mb-5">
        Your Journey, Just One Click Away
      </h2>
      <Search />
      <img src={assets.hero_bg_edit} alt="" />
    </div>
  );
};

export default Hero;
