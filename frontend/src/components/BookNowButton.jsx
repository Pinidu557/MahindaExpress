import React from "react";
import { MoveRight } from "lucide-react";

const BookNowButton = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2
        bg-gradient-to-r from-indigo-600 to-indigo-800 
        text-white font-semibold py-4 px-6   
        rounded-lg shadow-lg hover:shadow-xl 
        transition-all duration-300 hover:scale-105 text-xl
        hover:from-indigo-700 hover:to-indigo-800 cursor-pointer
        ${className}
      `}
    >
      Book Your Tickets Now
      <MoveRight className="w-7 h-7 " />
    </button>
  );
};

export default BookNowButton;
