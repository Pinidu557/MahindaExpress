import React, { useState, useContext, useEffect, useMemo } from "react";
import PassengerNavbar from "../components/PassengerNavbar";
import Footer from "../components/Footer";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, Bus, Loader2 } from "lucide-react";

// Route stops data
const routeStops = {
  "Colombo-Ampara": [
    "Ampara",
    "Uhana",
    "Mahaoya",
    "Padiyathalawa",
    "Beligalla",
    "Mahiyanganaya",
    "Hasalaka",
    "Ududumbara",
    "Hunnasgiriya",
    "Rambukwella",
    "Teldeniya",
    "Digana",
    "Kundasale",
    "Kandy",
    "Getambe",
    "Peradeniya",
    "Pilimathalawa",
    "Kadugannawa",
    "Mawanella",
    "Kegalle",
    "Galigamuwa",
    "Ambepussa",
    "Warakapola",
    "Pasyala",
    "Nittambuwa",
    "Kiribathgoda",
    "Kadawatha",
    "Colombo",
  ],
  "Ampara-Colombo": [
    "Colombo",
    "Kadawatha",
    "Kiribathgoda",
    "Nittambuwa",
    "Pasyala",
    "Warakapola",
    "Ambepussa",
    "Galigamuwa",
    "Kegalle",
    "Mawanella",
    "Kadugannawa",
    "Pilimathalawa",
    "Peradeniya",
    "Getambe",
    "Kandy",
    "Kundasale",
    "Digana",
    "Teldeniya",
    "Rambukwella",
    "Hunnasgiriya",
    "Ududumbara",
    "Hasalaka",
    "Mahiyanganaya",
    "Beligalla",
    "Padiyathalawa",
    "Mahaoya",
    "Uhana",
    "Ampara",
  ],
  "Colombo-Anuradhapura": [
    "Anuradhapura",
    "Kalattewa",
    "Galkulama",
    "Thirappane",
    "Maradankadawala",
    "Kekirawa",
    "Dambulla",
    "Galewela",
    "Melsiripura",
    "Ambanpola",
    "Gokarella",
    "Kurunegala",
    "Dambokka Entrance",
    "Meerigama Entrance",
    "Pasyala",
    "Nittambuwa",
    "Yakkala",
    "Miriswatta",
    "Beliummulla",
    "Mudungoda",
    "Imbulgoda",
    "Kirillawala",
    "Kadawatha",
    "Mahara",
    "Kiribathgoda",
    "Dalugama",
    "Thorana Junction",
    "Orugodawatta",
    "Maligawatta",
    "Colombo",
  ],
  "Anuradhapura-Colombo": [
    "Colombo",
    "Maligawatta",
    "Orugodawatta",
    "Thorana Junction",
    "Dalugama",
    "Kiribathgoda",
    "Mahara",
    "Kadawatha",
    "Kirillawala",
    "Imbulgoda",
    "Mudungoda",
    "Beliummulla",
    "Miriswatta",
    "Yakkala",
    "Nittambuwa",
    "Pasyala",
    "Meerigama Entrance",
    "Dambokka Entrance",
    "Kurunegala",
    "Gokarella",
    "Ambanpola",
    "Melsiripura",
    "Galewela",
    "Dambulla",
    "Kekirawa",
    "Maradankadawala",
    "Thirappane",
    "Galkulama",
    "Kalattewa",
    "Anuradhapura",
  ],
};

const SeatBooking = () => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const navigate = useNavigate();
  const routeData = useMemo(() => location.state || {}, [location.state]);

  // Track bookingId for update
  const [bookingId, setBookingId] = useState(routeData.bookingId || null);

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

  const [bookedSeats, setBookedSeats] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);

  const [seats, setSeats] = useState([]);
  const [PassengerName, setPassengerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [dropoffPoint, setDropoffPoint] = useState("");
  const [gender, setGender] = useState("");
  const [journeyDate, setJourneyDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableStops, setAvailableStops] = useState([]);
  const [routeKey, setRouteKey] = useState("");

  // Set default journey details from route data
  useEffect(() => {
    if (routeData.startLocation && routeData.endLocation) {
      // Start with empty values so the "Select..." options show by default
      setBoardingPoint("");
      setDropoffPoint("");

      // Determine route key based on start and end locations
      let key = "";
      if (
        (routeData.startLocation === "Colombo" &&
          routeData.endLocation === "Ampara") ||
        (routeData.startLocation === "Ampara" &&
          routeData.endLocation === "Colombo")
      ) {
        key = `${routeData.startLocation}-${routeData.endLocation}`;
        setRouteKey(key);
        setAvailableStops(routeStops[key] || []);
      } else if (
        (routeData.startLocation === "Colombo" &&
          routeData.endLocation === "Anuradhapura") ||
        (routeData.startLocation === "Anuradhapura" &&
          routeData.endLocation === "Colombo")
      ) {
        key = `${routeData.startLocation}-${routeData.endLocation}`;
        setRouteKey(key);
        setAvailableStops(routeStops[key] || []);
      } else {
        // For other routes, reset to empty key and stops
        setRouteKey("");
        setAvailableStops([]);
      }
    }

    if (routeData.journeyDate) {
      // Set the journey date and ensure it cannot be changed
      setJourneyDate(routeData.journeyDate);
    } else {
      // If no journey date is provided, use the current date
      setJourneyDate(new Date().toISOString().split("T")[0]);
    }

    // If bookingId is passed from navigation, set it
    if (routeData.bookingId) {
      setBookingId(routeData.bookingId);
    }
  }, [routeData]);

  // Fetch booked seats when route or journey date changes
  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!routeData.routeId || !journeyDate) {
        setIsLoadingSeats(false);
        return;
      }
      setIsLoadingSeats(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/booked-seats`,
          {
            params: {
              routeId: routeData.routeId,
              journeyDate: journeyDate,
            },
          }
        );
        if (data.success) {
          setBookedSeats(data.bookedSeats);
        } else {
          toast.error("Could not load seat availability");
        }
      } catch (error) {
        toast.error("Failed to check seat availability", error.message);
      } finally {
        setIsLoadingSeats(false);
      }
    };
    fetchBookedSeats();
  }, [backendUrl, routeData.routeId, journeyDate]);

  // Fetch booking details if bookingId exists (for update)
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/bookings/${bookingId}`
        );
        if (data.success) {
          setPassengerName(data.booking.passengerName);
          setMobileNumber(data.booking.mobileNumber);
          setEmail(data.booking.email);
          setSeats(data.booking.seats);
          setBoardingPoint(data.booking.boardingPoint);
          setDropoffPoint(data.booking.dropoffPoint);
          setGender(data.booking.gender);
          setJourneyDate(
            new Date(data.booking.journeyDate).toISOString().split("T")[0]
          );
        }
      } catch (error) {
        toast.error("Failed to fetch booking details", error.message);
      }
    };
    fetchBookingDetails();
  }, [bookingId, backendUrl]);

  // Handle seat selection
  const toggleSeat = (seat) => {
    if (!seat || bookedSeats.includes(seat)) return;
    if (seats.includes(seat)) {
      setSeats(seats.filter((s) => s !== seat));
    } else {
      setSeats([...seats, seat]);
    }
  };

  // Calculate total fare
  const totalFare = seats.length * (routeData.fare || 895);

  // Handle form submission (create or update booking)
  const onSubmieHandler = async (e) => {
    e.preventDefault();

    if (seats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        routeId: routeData.routeId || "64f9a3b3b6e351d5f13e3a20",
        passengerName: PassengerName,
        mobileNumber: mobileNumber,
        email: email || "no-email@example.com",
        seats: seats,
        boardingPoint: boardingPoint,
        dropoffPoint: dropoffPoint,
        gender: gender,
        journeyDate: new Date(journeyDate).toISOString(),
        totalFare: totalFare,
        status: "pending",
      };

      let data;
      if (bookingId) {
        // Update booking
        const response = await axios.put(
          `${backendUrl}/api/bookings/${bookingId}`,
          bookingData
        );
        data = response.data;
      } else {
        // Create booking
        const response = await axios.post(
          `${backendUrl}/api/bookings/checkout`,
          bookingData
        );
        data = response.data;
        if (data.success && data.booking?._id) {
          setBookingId(data.booking._id);
        }
      }

      if (data.success) {
        toast.success("Booking successful! Redirecting to payment");
        setTimeout(() => {
          navigate("/journeys/checkout/payment", {
            state: { bookingId: bookingId || data.booking._id },
          });
        }, 1500);
      } else {
        toast.error(data.message || "Something went wrong");
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create/update booking"
      );
      setIsSubmitting(false);
    }
  };

  // Format the journey date for display
  const formattedJourneyDate = journeyDate
    ? new Date(journeyDate).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <PassengerNavbar />

      {/* Journey Details Banner */}
      {routeData.startLocation && (
        <div className="bg-slate-800 w-[80%] p-6 rounded-xl mt-35 mb-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-slate-200">
            {routeData.startLocation} to {routeData.endLocation} -{" "}
            {routeData.busType || "Express Bus"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <MapPin className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">From (Route Start)</p>
                <p className="font-semibold">{routeData.startLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">To (Route End)</p>
                <p className="font-semibold">{routeData.endLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Date</p>
                <p className="font-semibold">{formattedJourneyDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Departure Time</p>
                <p className="font-semibold">{routeData.departureTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Arrival Time</p>
                <p className="font-semibold">{routeData.arrivalTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Bus className="text-indigo-400" size={20} />
              <div>
                <p className="text-gray-400 text-xs">Fare</p>
                <p className="font-semibold">LKR {routeData.fare}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4 mt-4 text-center text-blue-400">
        Select Seats & Fill Form
      </h1>

      <div className="flex flex-row gap-10 items-center justify-center min-h-screen w-[90%] mx-auto mb-10">
        {/* Seat Layout */}
        <div className="bg-slate-800 p-5 rounded-2xl shadow-lg w-[30%] flex-shrink-0">
          <div className="flex justify-center mb-4">
            <span className="bg-slate-700 px-4 py-2 rounded-lg">Front</span>
          </div>

          {isLoadingSeats ? (
            // Show loading spinner while fetching seats
            <div className="flex flex-col items-center justify-center p-10">
              <Loader2
                className="animate-spin text-indigo-500 mb-2"
                size={30}
              />
              <p className="text-gray-300">Loading seat availability...</p>
            </div>
          ) : (
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
                              : seats.includes(seat)
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
          )}
        </div>

        {/* Seat Details Form */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg w-[35%] flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4">Seat Details</h2>
          <p className="mb-2">
            Seats:{" "}
            <span className="text-indigo-400 font-semibold">
              {seats.join(", ") || "None"}
            </span>
          </p>
          <p className="mb-4">
            Total: <span className="text-green-400 font-bold">{totalFare}</span>{" "}
            LKR
          </p>

          <form className="flex flex-col gap-8" onSubmit={onSubmieHandler}>
            <input
              type="text"
              placeholder="Passenger Name"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
              value={PassengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Mobile Number"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="email address"
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              {availableStops.length > 0 ? (
                <>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
                    value={boardingPoint}
                    onChange={(e) => {
                      setBoardingPoint(e.target.value);
                      // Reset dropoff point when boarding point changes to prevent invalid selections
                      setDropoffPoint("");
                    }}
                    required
                  >
                    <option value="" className="text-gray-400">
                      Select Boarding Point
                    </option>
                    {availableStops.map((stop, index) => (
                      <option key={index} value={stop}>
                        {stop}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Select Boarding Point"
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
                    value={boardingPoint}
                    onChange={(e) => setBoardingPoint(e.target.value)}
                    required
                  />
                </>
              )}
            </div>

            <div>
              {availableStops.length > 0 ? (
                <>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
                    value={dropoffPoint}
                    onChange={(e) => setDropoffPoint(e.target.value)}
                    required
                    disabled={!boardingPoint}
                  >
                    <option value="" className="text-gray-400">
                      Select Dropoff Point
                    </option>
                    {availableStops
                      .map((stop, index) => {
                        // Get the indices of the boarding point and current stop
                        const boardingPointIndex =
                          availableStops.indexOf(boardingPoint);
                        const currentStopIndex = index;

                        // For routes starting with Colombo, dropoff must come before boarding point in the list
                        // For routes starting with Ampara or Anuradhapura, dropoff must come after boarding point in the list
                        const isValidStop = routeKey.startsWith("Colombo")
                          ? currentStopIndex < boardingPointIndex // For Colombo to destination routes
                          : currentStopIndex > boardingPointIndex; // For destination to Colombo routes

                        // Only show stops that make sense based on the boarding point selected
                        return boardingPoint && isValidStop ? (
                          <option key={index} value={stop}>
                            {stop}
                          </option>
                        ) : null;
                      })
                      .filter(Boolean)}{" "}
                    {/* Filter out null values */}
                  </select>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Select Dropoff Point"
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
                    value={dropoffPoint}
                    onChange={(e) => setDropoffPoint(e.target.value)}
                    required
                  />
                </>
              )}
            </div>
            <select
              className="px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" className="text-gray-400">
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <div>
              <input
                disabled
                type="date"
                placeholder="Journey Date"
                className="w-full px-3 py-2 rounded-lg bg-slate-700    text-white placeholder-white cursor-not-allowed focus:outline-none"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Journey date cannot be changed
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || seats.length === 0}
              className="bg-blue-600 py-2 rounded-lg font-semibold mt-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                "Continue to Pay"
              )}
            </button>
          </form>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-4 text-sm w-[10%] flex-shrink-0">
          {/* <div className="flex items-center gap-2">
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
          </div> */}
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
