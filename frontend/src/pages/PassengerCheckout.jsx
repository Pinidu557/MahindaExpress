import React, { useState } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";

const SeatBooking = () => {
  // Sample seat layout (rows with seat numbers)
  const seatLayout = [
    [1, 2, null, 3, 4],
    [5, 6, null, 7, 8],
    [9, 10, null, 11, 12],
    [13, 14, null, 15, 16],
    [17, 18, null, 19, 20],
    [21, 22, null, 23, 24],
    [25, 26, null, 27, 28],
    [29, 30, null, 31, 32],
    [null, null, null, 33, 34],
    [null, null, null, 35, 36],
    [37, 38, 39, 40, 41, 42],
  ];

  // Sample booked seats
  const bookedSeats = [7, 12, 15, 16];

  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    if (!seat || bookedSeats.includes(seat)) return;

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <PassengerNavbar />
      <h1 className="text-3xl font-bold mb-4 mt-35 text-center text-blue-400">
        Select Seats & Fill Form
      </h1>
      <h1 className="text-2xl font-bold mb-2 text-center">
        Ampara - Colombo 22 Mahinda Express - Super Luxury
      </h1>
      <div className="flex flex-row gap-10 items-center justify-center min-h-screen w-[90%] mx-auto mb-10">
        {/* Seat Layout */}
        <div className="bg-slate-800 p-5 rounded-2xl shadow-lg w-[30%] flex-shrink-0">
          <div className="flex justify-center mb-4">
            <span className="bg-slate-700 px-4 py-2 rounded-lg">Front</span>
          </div>
          <div className="grid gap-3">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-3">
                {row.map((seat, index) =>
                  seat ? (
                    <button
                      key={index}
                      onClick={() => toggleSeat(seat)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer
                        ${
                          bookedSeats.includes(seat)
                            ? "bg-red-800 cursor-not-allowed"
                            : selectedSeats.includes(seat)
                            ? "bg-indigo-500"
                            : "bg-green-600 hover:bg-green-500"
                        }`}
                      disabled={bookedSeats.includes(seat)}
                    >
                      {seat}
                    </button>
                  ) : (
                    <div key={index} className="w-10 h-10"></div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Seat Details Form */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg w-[35%] flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Seat Details</h2>
          <p className="mb-2">
            Seats:{" "}
            <span className="text-indigo-400 font-semibold">
              {selectedSeats.join(", ") || "None"}
            </span>
          </p>
          <p className="mb-4">Total: {selectedSeats.length * 895} LKR</p>

          <form className="flex flex-col gap-8">
            <input
              type="text"
              placeholder="Passenger Name"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email (Optional)"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Boarding Point"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Drop off point"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              className="bg-gradient-to-r from-indigo-500 to-indigo-900  py-2 rounded-lg font-semibold mt-3 cursor-pointer"
            >
              Continue to Pay
            </button>
          </form>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-1 gap-4 text-sm w-[10%] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-pink-500 rounded"></span> Ladies Only
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 rounded"></span> Gents Only
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-yellow-300 rounded"></span> Not Provided
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-gray-800 rounded"></span> Booking In
            Progress
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-600 rounded"></span> Available
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-red-800 rounded"></span> Already Booked
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SeatBooking;
