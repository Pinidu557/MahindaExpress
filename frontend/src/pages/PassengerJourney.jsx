import React from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import { useState } from "react";
import {
  Search,
  ArrowLeftRight,
  MoveRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const PassengerJourney = () => {
  const journeys = [
    {
      id: 1,
      route: "Panadura - Kandy 17",
      operator: "NCG Express - Super Luxury",
      certified: true,
      departureTime: "06:20 AM",
      departureDate: "30/08/2025",
      departureLocation: "Panadura",
      duration: "4Hr 10Min",
      arrivalTime: "10:30 AM",
      arrivalDate: "30/08/2025",
      arrivalLocation: "Kandy",
      price: "895 LKR",
      availability: "Available",
    },
    {
      id: 2,
      route: "Kandy - Panadura",
      operator: "NCG Express - Super Luxury",
      certified: true,
      departureTime: "03:20 PM",
      departureDate: "30/08/2025",
      departureLocation: "Kandy",
      duration: "4Hr 40Min",
      arrivalTime: "08:00 PM",
      arrivalDate: "30/08/2025",
      arrivalLocation: "Panadura",
      price: "895 LKR",
      availability: "Available",
    },

    {
      id: 3,
      route: "Kandy - Panadura",
      operator: "NCG Express - Super Luxury",
      certified: true,
      departureTime: "03:20 PM",
      departureDate: "30/08/2025",
      departureLocation: "Kandy",
      duration: "4Hr 40Min",
      arrivalTime: "08:00 PM",
      arrivalDate: "30/08/2025",
      arrivalLocation: "Panadura",
      price: "895 LKR",
      availability: "Available",
    },
  ];

  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [date, setDate] = useState();

  const stations = ["Panadura", "Colombo", "Galle", "Kandy", "Jaffna"];

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    alert(`Searching trains from ${from} to ${to} on ${date}`);
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <PassengerNavbar />
      <div className="bg-gray-900 text-white p-7 rounded-xl border border-white flex  items-center justify-center gap-4 mt-35 w-[76.5%]">
        {/* From */}
        <form
          onSubmit={handleSearch}
          className="flex gap-4 items-center w-full justify-between"
        >
          <div className="flex flex-col w-[25%]">
            <label className="text-sm font-bold text-yellow-400 mb-1 ">
              From
            </label>
            <input
              list="stations"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-md outline-none placeholder-white"
              placeholder="From"
            />
          </div>

          {/* Swap Icon */}
          <button
            onClick={handleSwap}
            className="mt-6 p-2 rounded-full hover:bg-gray-700 transition"
          >
            <ArrowLeftRight size={18} className="text-gray-400" />
          </button>

          {/* To */}
          <div className="flex flex-col w-[25%]">
            <label className="text-sm font-bold text-yellow-400 mb-1">To</label>
            <input
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-md outline-none placeholder-white"
              list="stations"
            />
          </div>

          {/* Datalist for station suggestions */}
          <datalist id="stations">
            {stations.map((station, idx) => (
              <option key={idx} value={station} />
            ))}
          </datalist>

          {/* Date */}
          <div className="flex flex-col w-[25%]">
            <label className="text-sm font-bold text-yellow-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-800 text-white p-2 rounded-md outline-none"
              placeholder="Date"
            />
          </div>

          {/* Search Button */}
          <button className="flex items-center justify-center gap-2 bg-purple-100 text-gray-900 px-5 py-2 rounded-md hover:bg-purple-200 transition w-[15%] mt-4.5 cursor-pointer font-bold">
            <Search size={18} /> Search
          </button>
        </form>
      </div>

      {/* booking card sections */}
      <div className="bg-slate-900 min-h-screen text-white px-6 py-8 w-[80%] ">
        {/* Journeys */}
        <div className="flex flex-col gap-6">
          {journeys.map((journey) => (
            <div
              key={journey.id}
              className="bg-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-6 shadow-lg"
            >
              {/* Left Section */}
              <div>
                <h2 className="text-lg font-semibold">
                  {journey.route}{" "}
                  <span className="text-gray-400">{journey.operator}</span>
                </h2>
                {journey.certified && (
                  <div className=" flex items-center gap-1 justify-center text-xs bg-green-700 px-2 py-1 rounded w-[15%]">
                    <ShieldCheck size={15} className="font-bold" />
                    Certified
                  </div>
                )}

                <div className="flex gap-16 mt-4">
                  {/* Departure */}
                  <div>
                    <p className="text-2xl font-bold">
                      {journey.departureTime}
                    </p>
                    <p className="text-gray-400 text-sm">Departure</p>
                    <p>{journey.departureLocation}</p>
                    <p className="text-gray-400 text-sm">
                      {journey.departureDate}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-center text-gray-400">
                    →<br />
                    <span className="text-sm">
                      Duration (Approx): {journey.duration}
                    </span>
                  </div>

                  {/* Arrival */}
                  <div>
                    <p className="text-2xl font-bold">{journey.arrivalTime}</p>
                    <p className="text-gray-400 text-sm">Arrival</p>
                    <p>{journey.arrivalLocation}</p>
                    <p className="text-gray-400 text-sm">
                      {journey.arrivalDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex flex-col  items-end gap-6">
                <span
                  className={`px-2   py-2 rounded-lg text-sm ${
                    journey.availability === "Available"
                      ? "bg-green-700 font-bold"
                      : "bg-red-700 font-semibold"
                  }`}
                >
                  {journey.availability}
                </span>
                <p className="text-2xl font-bold">{journey.price}</p>

                <div className="flex gap-3">
                  <button className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 cursor-pointer flex gap-1 items-center justify-center">
                    <Clock size={20} />
                    Timetable
                  </button>
                  <button
                    onClick={() => navigate("/journeys/checkout")}
                    className="bg-indigo-600 flex items-center justify-center gap-1 px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    Book Now
                    <MoveRight size={20} className=" text-white font-bold" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PassengerJourney;
