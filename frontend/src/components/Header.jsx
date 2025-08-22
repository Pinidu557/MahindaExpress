import React from "react";
import { assets } from "../assets/assets";

function Header() {
  return (
    <div className="flex flex-col items-center  mt-20 px-4 text-center ">
      <img
        src={assets.header_img}
        alt=""
        className="w-36 h-36 rounded-full mb-6 "
      />
      <h1 className="flex items-center gap-2 text-xl font-medium mb-2">
        Hey Developer
        <img src={assets.hand_wave} alt="" className="w-8 aspect-square" />
      </h1>
      <h2 className="text-3xl font-semibold mb-4">Welcome to our app</h2>
      <p className="mb-8 max-w-2/4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci ab
        odit voluptatibus odio fugiat magnam, praesentium sequi! Itaque nihil
        eius unde reiciendis, qui iusto aliquam sit, quaerat, voluptas excepturi
        quos.
      </p>
      <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-300 transition-all cursor-pointer">
        Get Started
      </button>
    </div>
  );
}

export default Header;
