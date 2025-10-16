import React, { useContext, useEffect, useState } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import {
  Search,
  ArrowLeftRight,
  MoveRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
} from "lucide-react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const PassengerJourney = () => {
  // Removed authentication-related states

  // Function to get today's date in YYYY-MM-DD format for min attribute
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to validate if selected date is not in the past
  const validateDateNotPast = (selectedDate) => {
    const today = new Date();
    const selected = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  // Define route-specific time schedules
  const routeSchedules = {
    "Colombo-Ampara": [
      { departure: "10:45 AM", arrival: "03:15 PM", duration: "4h" },
    ],
    "Colombo-Anuradhapura": [
      { departure: "07:00 AM", arrival: "01:25 PM", duration: "4h" },
    ],
    "Kaduwela-Kollupitiya": [
      { departure: "06:00 AM", arrival: "10:00 AM", duration: "4h" },
    ],
    // Add more route schedules as needed
  };

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(getTodayFormatted());
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [errors, setErrors] = useState({});
  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");

  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();

  const stations = [
    "Panadura",
    "Colombo",
    "Galle",
    "Kandy",
    "Jaffna",
    "Ampara",
    "Anuradhapura",
  ];

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  // Function to check if departure time has passed
  const isDepartureTimePassed = (departureTime, selectedDate) => {
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDay = new Date(selectedDate).setHours(0, 0, 0, 0);

    // If selected date is in the future, departure time hasn't passed
    if (selectedDay > today) {
      return false;
    }

    // If selected date is today, check the time
    if (selectedDay === today) {
      // Parse departure time (e.g., "06:00 AM")
      const [time, period] = departureTime.split(" ");
      const [hours, minutes] = time.split(":");

      let departureHours = parseInt(hours);
      // Convert to 24-hour format
      if (period === "PM" && departureHours < 12) {
        departureHours += 12;
      } else if (period === "AM" && departureHours === 12) {
        departureHours = 0;
      }

      // Compare with current time
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      if (departureHours < currentHours) {
        return true; // Departure hour has passed
      } else if (
        departureHours === currentHours &&
        parseInt(minutes) <= currentMinutes
      ) {
        return true; // Departure hour is current hour but minutes have passed
      }
    }

    return false;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!from) {
      newErrors.from = "Please select a departure location";
    }

    if (!to) {
      newErrors.to = "Please select a destination";
    } else if (from === to) {
      newErrors.to = "Departure and destination cannot be the same";
    }

    if (!date) {
      newErrors.date = "Please select a travel date";
    } else if (!validateDateNotPast(date)) {
      newErrors.date = "Date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !fromError && !toError;
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSearching(true);
    setSearchPerformed(true);

    // Filter routes based on search criteria
    const results = routes.filter((route) => {
      return route.startLocation === from && route.endLocation === to;
    });

    setFilteredRoutes(results);
    setSearching(false);
  };

  useEffect(() => {
    // Set today's date when component mounts
    setDate(getTodayFormatted());
    
    const fetchRoutes = async () => {
      try {
        console.log("Fetching routes from:", `${backendUrl}/api/routes`);
        const { data } = await axios.get(`${backendUrl}/api/routes`);
        console.log("Fetched routes:", data);
        
        // Initialize the first time slot as selected for each route
        const initialSelectedTimes = {};
        data.forEach((route) => {
          initialSelectedTimes[route._id] = 0; // First time is selected by default
        });
        setSelectedTimes(initialSelectedTimes);
        setRoutes(data);
        setFilteredRoutes(data); // Initially show all routes
      } catch (error) {
        console.error("Error fetching routes:", error);
        toast.error("Failed to fetch routes: " + error.message);
        setRoutes([]);
        setFilteredRoutes([]);
      }
    };
    fetchRoutes();
  }, [backendUrl]);

  // Updated function to handle booking button click - without authentication check
  const handleBookNowClick = async (route, timeSlot, journeyDateToUse) => {
    const bookingData = {
      routeId: route._id || route.id,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      departureTime: timeSlot.departure,
      arrivalTime: timeSlot.arrival,
      journeyDate: journeyDateToUse,
      fare: route.fare || "2000",
      duration: timeSlot.duration,
      busType: "Super Luxury",
    };

    try {
      const { data } = await axios.get(backendUrl + "/api/user/data", {
        withCredentials: true,
      });

      console.log("Auth response:", data); // For debugging

      // Check if API call was successful and user is logged in
      if (data.success && data.userData && data.userData.isLoggedIn) {
        navigate("/journeys/checkout", { state: bookingData });
      } else {
        toast.info("Please log in to book tickets");
        navigate("/login", {
          state: {
            redirectAfterLogin: "/journeys/checkout",
            bookingData,
          },
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication check failed. Please login.");

      navigate("/login", {
        state: {
          redirectAfterLogin: "/journeys/checkout",
          bookingData,
        },
      });
    }
  };
  //   try {
  //     // Check authentication status from backend
  //     const { data } = await axios.get(`${backendUrl}/api/auth/check-auth`, {
  //       withCredentials: true,
  //     });

  //     if (data.isAuthenticated) {
  //       // User is logged in, go to checkout
  //       navigate("/journeys/checkout", { state: bookingData });
  //     } else {
  //       // Not logged in, redirect to login
  //       toast.info("Please log in to book tickets");
  //       navigate("/login", {
  //         state: {
  //           redirectAfterLogin: "/journeys/checkout",
  //           bookingData,
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     toast.error("Authentication check failed. Please login.", error.message);
  //     navigate("/login", {
  //       state: {
  //         redirectAfterLogin: "/journeys/checkout",
  //         bookingData,
  //       },
  //     });
  //   }
  // };

  // Determine which routes to display
  const routesToDisplay = searchPerformed ? filteredRoutes : routes;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <PassengerNavbar />
      <div className="bg-gray-900 text-white p-7 rounded-xl border border-white flex items-center justify-center gap-4 mt-35 w-[76.5%]">
        {/* From */}
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-4 items-center w-full justify-between"
        >
          <div className="flex flex-col w-[25%]">
            <label className="text-sm font-bold text-yellow-400 mb-1">
              From
            </label>
            <input
              list="stations"
              value={from}
              onChange={(e) => {
                const value = e.target.value;
                setFrom(value);
                // Clear errors when valid input is entered
                if (fromError) setFromError("");
                if (errors.from) setErrors({ ...errors, from: "" });
              }}
              onKeyDown={(e) => {
                // Block numbers and special characters
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                  setFromError("Numbers are not allowed");
                  return;
                }
                // Clear error when valid key is pressed
                if (fromError) setFromError("");
              }}
              className={`bg-gray-800 text-white p-2 rounded-md outline-none placeholder-white ${
                errors.from || fromError ? "border border-red-500" : ""
              }`}
              placeholder="From"
            />
            {(errors.from || fromError) && (
              <p className="text-red-500 text-xs mt-1">{fromError || errors.from}</p>
            )}
          </div>

          {/* Swap Icon */}
          <button
            type="button"
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
              onChange={(e) => {
                const value = e.target.value;
                setTo(value);
                // Clear errors when valid input is entered
                if (toError) setToError("");
                if (errors.to) setErrors({ ...errors, to: "" });
              }}
              onKeyDown={(e) => {
                // Block numbers and special characters
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                  setToError("Numbers are not allowed");
                  return;
                }
                // Clear error when valid key is pressed
                if (toError) setToError("");
              }}
              className={`bg-gray-800 text-white p-2 rounded-md outline-none placeholder-white ${
                errors.to || toError ? "border border-red-500" : ""
              }`}
              list="stations"
            />
            {(errors.to || toError) && (
              <p className="text-red-500 text-xs mt-1">{toError || errors.to}</p>
            )}
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
            <div className="relative">
              <input
                type="date"
                value={date}
                min={getTodayFormatted()}
                max="2030-12-31"
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (selectedDate && validateDateNotPast(selectedDate)) {
                    setDate(selectedDate);
                    if (errors.date) setErrors({ ...errors, date: "" });
                  } else if (selectedDate) {
                    setErrors({ ...errors, date: "Date cannot be in the past" });
                  }
                }}
                className={`bg-gray-800 text-white p-2 rounded-md outline-none w-full ${
                  errors.date ? "border border-red-500" : ""
                }`}
                placeholder="Date"
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-white pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={searching}
            className="flex items-center justify-center gap-2 bg-purple-100 text-gray-900 px-5 py-2 rounded-md hover:bg-purple-200 transition w-[15%] mt-4.5 cursor-pointer font-bold disabled:opacity-70"
          >
            {searching ? (
              "Searching..."
            ) : (
              <>
                <Search size={18} /> Search
              </>
            )}
          </button>
        </form>
      </div>

      {/* booking card sections */}
      <div className="bg-slate-900 min-h-screen text-white px-6 py-8 w-[80%] ">
        {/* Journeys */}
        {searchPerformed && filteredRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-slate-800 p-8 rounded-xl">
            <AlertCircle size={48} className="text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">No routes available</h3>
            <p className="text-gray-400 text-center max-w-lg">
              We couldn't find any buses from {from} to {to} on{" "}
              {new Date(date).toLocaleDateString()}. Please try a different date
              or route.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {routesToDisplay.map((route) => {
              // Get the route key to look up in routeSchedules
              const routeKey = `${route.startLocation}-${route.endLocation}`;

              // Get the schedule for this route (or use default schedule)
              const scheduleForRoute = routeSchedules[routeKey] || [
                {
                  departure: "06:00 AM",
                  arrival: "10:00 AM",
                  duration: "4h",
                },
                {
                  departure: "02:00 PM",
                  arrival: "06:00 PM",
                  duration: "4h",
                },
              ];

              // Get the selected time for this route
              const timeSlot = scheduleForRoute[selectedTimes[route._id] || 0];

              // Check if departure time has passed
              const isTimePassed = isDepartureTimePassed(
                timeSlot.departure,
                searchPerformed ? date : new Date()
              );

              // Calculate journey date to use
              const journeyDateToUse = isTimePassed
                ? new Date(new Date().setDate(new Date().getDate() + 1))
                    .toISOString()
                    .split("T")[0]
                : searchPerformed && date
                ? date
                : new Date().toISOString().split("T")[0];

              // Check vehicle availability
              const hasAssignedVehicles = route.assignedVehicleIds && route.assignedVehicleIds.length > 0;
              
              // Check if all assigned vehicles are unavailable
              const allVehiclesUnavailable = hasAssignedVehicles && 
                route.assignedVehicleIds.every(vehicle => 
                  vehicle.vehicleStatus === "Unavailable" || vehicle.vehicleStatus === "Under Maintenance"
                );
              
              // Check if at least one vehicle is available
              const hasAvailableVehicle = hasAssignedVehicles && 
                route.assignedVehicleIds.some(vehicle => 
                  vehicle.vehicleStatus === "Available"
                );

              // Check if seats are available (assuming 42 seats per vehicle)
              const totalSeatsPerVehicle = 42;
              const availableSeatsCount = hasAvailableVehicle ? 
                route.assignedVehicleIds.filter(v => v.vehicleStatus === "Available").length * totalSeatsPerVehicle : 0;
              
              // For now, we'll assume seats are available if vehicle is available
              // In a real implementation, you'd check booked seats from the database
              const hasAvailableSeats = availableSeatsCount > 0;

              console.log(`Route ${route.routeNumber || route.startLocation + '-' + route.endLocation}:`, {
                hasAssignedVehicles,
                allVehiclesUnavailable,
                hasAvailableVehicle,
                vehicles: route.assignedVehicleIds?.map(v => ({
                  plateNumber: v.plateNumber,
                  status: v.vehicleStatus
                }))
              });

              return (
                <div
                  key={route._id}
                  className="bg-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-6 shadow-lg"
                >
                  {/* Left Section */}
                  <div className="w-full">
                    <h2 className="text-2xl font-semibold">
                      {route.startLocation}-{route.endLocation}
                    </h2>
                    <div className="flex items-center gap-1 justify-center text-xs bg-green-700 px-2 py-1 rounded w-fit mt-2">
                      <ShieldCheck size={15} className="font-bold" />
                      Certified
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-gray-700 px-3 py-1 rounded w-fit mt-3">
                      <span>
                        Journey Date:{" "}
                        {isTimePassed
                          ? new Date(
                              new Date().setDate(new Date().getDate() + 1)
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : searchPerformed && date
                          ? new Date(date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : new Date().toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                      </span>
                    </div>

                    {/* Display only the selected time */}
                    <div className="flex gap-16 mt-4">
                      {/* Departure */}
                      <div>
                        <p className="text-2xl font-bold">
                          {timeSlot.departure}
                        </p>
                        <p className="text-gray-400 text-sm">Departure</p>
                        <p>{route.startLocation}</p>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center justify-center text-gray-400">
                        →
                        <br />
                        <span className="text-sm">
                          Duration (Approx): {timeSlot.duration}
                        </span>
                      </div>

                      {/* Arrival */}
                      <div>
                        <p className="text-2xl font-bold">{timeSlot.arrival}</p>
                        <p className="text-gray-400 text-sm">Arrival</p>
                        <p>{route.endLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end gap-6 min-w-[120px]">
                    {/* Vehicle Status Badge */}
                    {hasAvailableVehicle && hasAvailableSeats ? (
                      <span className="px-3 py-2 rounded-lg text-sm bg-green-700 font-bold">
                        Available
                      </span>
                    ) : hasAvailableVehicle && !hasAvailableSeats ? (
                      <span className="px-3 py-2 rounded-lg text-sm bg-orange-600 font-bold">
                        Seats Full
                      </span>
                    ) : allVehiclesUnavailable ? (
                      <span className="px-3 py-2 rounded-lg text-sm bg-red-700 font-bold">
                        Unavailable
                      </span>
                    ) : (
                      <span className="px-3 py-2 rounded-lg text-sm bg-yellow-600 font-bold">
                        No Vehicles
                      </span>
                    )}
                    
                    <p className="text-2xl font-bold">
                      <span className="mr-3">LKR</span>
                      {route.fare}
                    </p>

                    <div className="flex flex-col gap-2">
                        {/* Conditional Booking Button */}
                        {hasAvailableVehicle && hasAvailableSeats ? (
                          <button
                            onClick={() =>
                              handleBookNowClick(
                                route,
                                timeSlot,
                                journeyDateToUse
                              )
                            }
                            className={`flex items-center justify-center gap-1 px-8 py-3 rounded-lg whitespace-nowrap text-md
                              bg-indigo-600 cursor-pointer font-semibold hover:bg-indigo-700`}
                          >
                            {isTimePassed ? (
                              <>
                                Book for tomorrow
                                <MoveRight
                                  size={20}
                                  className="text-white font-bold"
                                />
                              </>
                            ) : (
                              <>
                                Book Now
                                <MoveRight
                                  size={20}
                                  className="text-white font-bold"
                                />
                              </>
                            )}
                          </button>
                        ) : hasAvailableVehicle && !hasAvailableSeats ? (
                          <button
                            disabled
                            className={`flex items-center justify-center gap-1 px-8 py-3 rounded-lg whitespace-nowrap text-md
                              bg-gray-600 cursor-not-allowed font-semibold opacity-50`}
                          >
                            Seats Full
                          </button>
                        ) : allVehiclesUnavailable ? (
                          <button
                            disabled
                            className={`flex items-center justify-center gap-1 px-8 py-3 rounded-lg whitespace-nowrap text-md
                              bg-gray-600 cursor-not-allowed font-semibold opacity-50`}
                          >
                            Route Unavailable
                          </button>
                        ) : (
                          <button
                            disabled
                            className={`flex items-center justify-center gap-1 px-8 py-3 rounded-lg whitespace-nowrap text-md
                              bg-gray-600 cursor-not-allowed font-semibold opacity-50`}
                          >
                            No Vehicles Available
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PassengerJourney;
