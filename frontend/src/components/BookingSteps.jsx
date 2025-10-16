import React from "react";
import { Search, Ticket, CreditCard, Telescope } from "lucide-react";

const BookingSteps = () => {
  return (
    <div className="py-16 px-6 md:px-16 -mt-12">
      {/* Title */}
      <div className="text-center mb-12">
        <h4 className="text-indigo-400 font-medium text-xl">How It Works</h4>
        <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
          4 Steps To Booking Our Bus
        </h2>
        <p className="text-gray-400 mt-3">
          It’s never been easier to book your journey online!
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto  ">
        {/* Step 1 */}
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:shadow-amber-400 hover:shadow-sm hover:translate-y-2 transform transition">
          <Telescope className="text-yellow-400 w-12 h-12 mb-4" />
          <h3 className="font-bold text-lg mb-2">Visit mahindaexpress.lk</h3>
          <p className="text-sm text-gray-400">
            Experience the enchantment of travel with mahindaexpress.lk. <br />
            Embark on your next bus adventure now!
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center  hover:shadow-amber-400 hover:shadow-sm hover:translate-y-2 transform transition">
          <Search className="text-yellow-400 w-12 h-12 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">
            Search Your Transit
          </h3>
          <p className="text-gray-400 text-sm">
            Choose your pickup, destination, and journey date to see available
            means of transportation.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:shadow-amber-400 hover:shadow-sm hover:translate-y-2 transform transition">
          <Ticket className="text-yellow-400 w-12 h-12 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">
            Reserve Your Seat
          </h3>
          <p className="text-gray-400 text-sm">
            Choose the best ticket to instantly reserve your booking with the
            comfort of your home.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center md:col-span-3 lg:col-span-1 hover:shadow-amber-400 hover:shadow-sm hover:translate-y-2 transform transition">
          <CreditCard className="text-yellow-400 w-12 h-12 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">
            Complete The Payment
          </h3>
          <p className="text-gray-400 text-sm">
            Pay for your tickets using any major card or even cryptocurrency and
            print your tickets with ease.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSteps;
